#!/usr/bin/env python3
import sys
import json
import joblib
import pandas as pd
import re
import nltk
import os
import numpy as np
import tensorflow as tf
# Suppress TensorFlow logging and progress bars
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF logging
tf.keras.utils.disable_interactive_logging()  # Disable progress bars
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Layer, Input, Dense, Dropout, Concatenate, Lambda
from tensorflow.keras.saving import register_keras_serializable
from transformers import TFDistilBertModel, DistilBertTokenizerFast
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download VADER lexicon if not already available.
nltk.download('vader_lexicon', quiet=True)
sid = SentimentIntensityAnalyzer()

# =============================================================================
# Register the custom function used in your model.
# =============================================================================
@register_keras_serializable()
class BertLayer(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bert = None
        
    def build(self, input_shape):
        # Load BERT model in build method to ensure proper initialization
        self.bert = TFDistilBertModel.from_pretrained('distilbert-base-uncased', from_pt=True)
        self.bert.trainable = False
        super().build(input_shape)

    def call(self, inputs):
        input_ids, attention_mask = inputs
        # The casting is now handled within the layer
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            training=False
        )
        return outputs.last_hidden_state[:, 0, :]

    def compute_output_shape(self, input_shape):
        return (input_shape[0][0], 768)  # DistilBERT base hidden size is 768

    def get_config(self):
        config = super().get_config()
        return config

@register_keras_serializable(package="BotDetection")
def create_model(max_length=64):
    """Create the model architecture exactly as it was trained"""
    # Text inputs
    input_ids = Input(shape=(max_length,), dtype=tf.int32, name="input_ids")
    attention_mask = Input(shape=(max_length,), dtype=tf.int32, name="attention_mask")
    
    # Create custom BERT layer to handle the tensor operations
    bert_layer = BertLayer()
    cls_token = bert_layer([input_ids, attention_mask])
    
    # Numeric features input
    numeric_input = Input(shape=(7,), dtype=tf.float32, name="numeric_input")
    
    # Combine features
    combined = Concatenate()([cls_token, numeric_input])
    x = Dense(128, activation='relu')(combined)
    x = Dropout(0.2)(x)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.2)(x)
    output = Dense(1, activation='sigmoid')(x)
    
    model = tf.keras.Model(
        inputs={
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "numeric_input": numeric_input
        },
        outputs=output
    )
    return model

# =============================================================================
# Utility Functions
# =============================================================================
def clean_text(text: str) -> str:
    """Clean text by lowercasing and removing URLs, mentions, hashtags, punctuation, and digits."""
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    return text.strip()

def count_hashtags(hashtag_str: str) -> int:
    """Count hashtags from a string (assuming hashtags are separated by spaces or commas)."""
    if pd.isnull(hashtag_str) or hashtag_str == "":
        return 0
    hashtags = re.split('[, ]+', hashtag_str.strip())
    return len([tag for tag in hashtags if tag != ""])

# =============================================================================
# OLD MODEL (joblib)
# =============================================================================
def load_old_model():
    model_file = os.path.join(os.path.dirname(__file__), "modal", "bot_detection_model.pkl")
    ensemble_model = joblib.load(model_file)
    clf_pipeline = ensemble_model["clf_pipeline"]
    iso_pipeline = ensemble_model["iso_pipeline"]
    text_feature = ensemble_model["text_feature"]
    numeric_features = ensemble_model["numeric_features"]
    threshold = ensemble_model["threshold"]
    return clf_pipeline, iso_pipeline, text_feature, numeric_features, threshold

def predict_bot_old(account_data: dict) -> dict:
    clf_pipeline, iso_pipeline, text_feature, numeric_features, threshold = load_old_model()
    df = pd.DataFrame([account_data])
    if "Tweet" not in df.columns:
        df["Tweet"] = df.get("Clean_Tweet", "")
    if "Hashtags" not in df.columns:
        df["Hashtags"] = ""
    if "Clean_Tweet" not in df.columns:
        df["Clean_Tweet"] = df["Tweet"].apply(clean_text)
    if "Tweet_Length" not in df.columns:
        df["Tweet_Length"] = df["Tweet"].apply(lambda x: len(str(x).split()))
    if "Hashtag_Count" not in df.columns:
        df["Hashtag_Count"] = df["Hashtags"].apply(count_hashtags)
    if "Sentiment" not in df.columns:
        df["Sentiment"] = df["Clean_Tweet"].apply(lambda x: sid.polarity_scores(x)["compound"])
    
    features = df[[text_feature] + numeric_features]
    lr_probability = clf_pipeline.predict_proba(features)[:, 1][0]
    iso_prediction = iso_pipeline.predict(features[numeric_features])[0]
    iso_prediction_binary = 1 if iso_prediction == -1 else 0
    predicted_label = 1 if (lr_probability > threshold or iso_prediction_binary == 1) else 0
    return {
        "Predicted_Bot_Label": predicted_label,
        "LR_Probability": lr_probability,
        "Isolation_Forest_Pred": iso_prediction_binary,
        "model_version": "old"
    }

# =============================================================================
# IMPROVED MODEL (Keras)
# =============================================================================
def load_improved_model():
    """
    Load the improved bot detection model saved as an HDF5 file along with its tokenizer and scaler.
    """
    model_path = os.path.join(os.path.dirname(__file__), "modal", "improved_bot_detection_model.h5")
    
    # Create a fresh model instance
    model = create_model()
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    try:
        # Try to load weights
        model.load_weights(model_path)
    except Exception as e:
        print(f"Error loading model weights: {e}")
        raise
    
    # Load the tokenizer
    tokenizer_path = os.path.join(os.path.dirname(__file__), "modal", "tokenizer")
    tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_path)
    
    # Load the scaler
    scaler_path = os.path.join(os.path.dirname(__file__), "modal", "scaler.pkl")
    scaler = joblib.load(scaler_path)
    
    numeric_features = ['Retweet Count', 'Mention Count', 'Follower Count', 
                       'Verified', 'Tweet_Length', 'Hashtag_Count', 'Sentiment']
    max_length = 64
    
    return model, tokenizer, scaler, numeric_features, max_length

def predict_bot_improved(account_data: dict) -> dict:
    """
    Prepare the input data, tokenize the text, scale numeric features,
    and use the improved model to predict the probability that the account is a bot.
    """
    improved_model, tokenizer, scaler, numeric_features, max_length = load_improved_model()
    df = pd.DataFrame([account_data])
    
    if "Tweet" not in df.columns:
        df["Tweet"] = df.get("Clean_Tweet", "")
    if "Hashtags" not in df.columns:
        df["Hashtags"] = ""
    if "Clean_Tweet" not in df.columns:
        df["Clean_Tweet"] = df["Tweet"].apply(clean_text)
    if "Tweet_Length" not in df.columns:
        df["Tweet_Length"] = df["Tweet"].apply(lambda x: len(str(x).split()))
    if "Hashtag_Count" not in df.columns:
        df["Hashtag_Count"] = df["Hashtags"].apply(count_hashtags)
    if "Sentiment" not in df.columns:
        df["Sentiment"] = df["Clean_Tweet"].apply(lambda x: sid.polarity_scores(x)["compound"])
    
    texts = df["Clean_Tweet"].tolist()
    encoding = tokenizer(
        texts,
        padding="max_length",
        truncation=True,
        max_length=max_length,
        return_tensors="np"
    )
    input_ids = encoding["input_ids"]
    attention_mask = encoding["attention_mask"]
    
    num_data = df[numeric_features].values.astype(float)
    num_data_scaled = scaler.transform(num_data)
    
    model_inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "numeric_input": num_data_scaled
    }
    
    # Make prediction with verbose=0 to suppress progress bar
    preds = improved_model.predict(model_inputs, verbose=0)
    
    if preds.ndim == 2:
        prob = preds[0][0]
    else:
        prob = preds[0]
    
    predicted_label = 1 if prob > 0.5 else 0
    return {
        "Predicted_Bot_Label": predicted_label,
        "LR_Probability": float(prob),
        "Isolation_Forest_Pred": None,  # Not applicable for the improved model
        "model_version": "improved"
    }

# =============================================================================
# Main Prediction Function
# =============================================================================
def predict_bot(account_data: dict) -> dict:
    version = account_data.get("model_version", "old").lower()
    if version == "improved":
        return predict_bot_improved(account_data)
    else:
        return predict_bot_old(account_data)

def main():
    try:
        data = sys.stdin.read()
        account_data = json.loads(data)
        result = predict_bot(account_data)
        # Ensure only the JSON result is printed
        sys.stdout.write(json.dumps(result) + "\n")
        sys.stdout.flush()
    except Exception as e:
        error_msg = {"error": "Prediction failed", "details": str(e)}
        sys.stdout.write(json.dumps(error_msg) + "\n")
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
