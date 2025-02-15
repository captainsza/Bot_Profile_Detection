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
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.keras.utils.disable_interactive_logging()

from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Layer, Input, Dense, Dropout, Concatenate
from tensorflow.keras.saving import register_keras_serializable
from transformers import TFDistilBertModel, DistilBertTokenizerFast, DistilBertTokenizer, DistilBertModel

# Download VADER lexicon if not already available.
nltk.download('vader_lexicon', quiet=True)
from nltk.sentiment.vader import SentimentIntensityAnalyzer
sid = SentimentIntensityAnalyzer()

# =============================================================================
# CUSTOM LAYER & MODEL (For improved model – leave unchanged)
# =============================================================================
@register_keras_serializable()
class BertLayer(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bert = None
        
    def build(self, input_shape):
        self.bert = TFDistilBertModel.from_pretrained('distilbert-base-uncased', from_pt=True)
        self.bert.trainable = False
        super().build(input_shape)

    def call(self, inputs):
        input_ids, attention_mask = inputs
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            training=False
        )
        # Use tf.reduce_mean instead of .mean()
        return tf.reduce_mean(outputs.last_hidden_state, axis=1)

    def compute_output_shape(self, input_shape):
        return (input_shape[0][0], 768)

    def get_config(self):
        config = super().get_config()
        return config

@register_keras_serializable(package="BotDetection")
def create_model(max_length=64):
    input_ids = Input(shape=(max_length,), dtype=tf.int32, name="input_ids")
    attention_mask = Input(shape=(max_length,), dtype=tf.int32, name="attention_mask")
    bert_layer = BertLayer(name='bert_layer')
    sequence_output = bert_layer([input_ids, attention_mask])
    numeric_input = Input(shape=(7,), dtype=tf.float32, name="numeric_input")
    combined = Concatenate()([sequence_output, numeric_input])
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
# UTILITY FUNCTIONS
# =============================================================================
def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    return text.strip()

def count_hashtags(hashtag_str: str) -> int:
    if pd.isnull(hashtag_str) or hashtag_str == "":
        return 0
    hashtags = re.split('[, ]+', hashtag_str.strip())
    return len([tag for tag in hashtags if tag != ""])

# =============================================================================
# IMPROVED MODEL (Keras) – Note: now load the scaler from "old_scaler.pkl" so that it is separate.
# =============================================================================
def load_improved_model():
    base_path = os.path.join(os.path.dirname(__file__), "modal")
    model_path = os.path.join(base_path, "improved_bot_detection_model.h5")
    try:
        model = create_model()
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        try:
            model.load_weights(model_path)
            print("Model weights loaded successfully", file=sys.stderr)
        except ValueError as ve:
            print(f"Error loading weights - architecture mismatch: {ve}", file=sys.stderr)
            try:
                model.load_weights(model_path, by_name=True, skip_mismatch=True)
                print("Model weights loaded with skip_mismatch=True", file=sys.stderr)
            except Exception as e:
                raise Exception(f"Failed to load weights even with skip_mismatch: {e}")
        tokenizer_path = os.path.join(base_path, "tokenizer")
        # IMPORTANT: load the old scaler (renamed to old_scaler.pkl) for the improved model
        scaler_path = os.path.join(base_path, "scaler.pkl")
        tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_path)
        scaler = joblib.load(scaler_path)
        return model, tokenizer, scaler, ['Retweet Count', 'Mention Count', 'Follower Count', 
                                        'Verified', 'Tweet_Length', 'Hashtag_Count', 'Sentiment'], 64
    except Exception as e:
        print(f"Error in load_improved_model: {str(e)}", file=sys.stderr)
        raise

def predict_bot_improved(account_data: dict) -> dict:
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
    
    preds = improved_model.predict(model_inputs, verbose=0)
    prob = preds[0][0] if preds.ndim == 2 else preds[0]
    predicted_label = 1 if prob > 0.5 else 0
    return {
        "Predicted_Bot_Label": predicted_label,
        "LR_Probability": float(prob),
        "Isolation_Forest_Pred": None,
        "model_version": "improved"
    }

# =============================================================================
# NEW: TRADITIONAL2 MODEL (XGBoost + BERT embedding)
# =============================================================================
def prepare_features_traditional2(account_data: dict, tokenizer, bert_model):
    tweet = account_data.get("Tweet", "")
    cleaned_tweet = clean_text(tweet)
    
    # Get BERT embeddings
    encoding = tokenizer(
        cleaned_tweet,
        truncation=True,
        padding="max_length",
        max_length=64,
        return_tensors="pt"
    )
    import torch
    device = "cuda" if torch.cuda.is_available() else "cpu"
    encoding = {k: v.to(device) for k, v in encoding.items()}
    bert_model.to(device)
    bert_model.eval()
    with torch.no_grad():
        outputs = bert_model(**encoding)
        embedding = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
    
    # Calculate numeric features
    retweet_count = float(account_data.get("Retweet Count", 0))
    mention_count = float(account_data.get("Mention Count", 0))
    follower_count = float(account_data.get("Follower Count", 0))
    verified = 1.0 if account_data.get("Verified", False) else 0.0
    tweet_length = float(len(cleaned_tweet.split()))
    hashtag_count = float(count_hashtags(account_data.get("Hashtags", "")))
    follower_per_retweet = follower_count / (retweet_count + 1.0)
    
    numeric_vector = np.array([
        retweet_count,
        mention_count,
        follower_count,
        verified,
        tweet_length,
        hashtag_count,
        follower_per_retweet
    ]).reshape(1, -1)
    
    return embedding, numeric_vector

def predict_bot_traditional2(account_data: dict) -> dict:
    base_path = os.path.join(os.path.dirname(__file__), "modal")
    
    # Load models and scaler
    try:
        xgb_model = joblib.load(os.path.join(base_path, "xgb_bot_detection_model.pkl"))
        scaler = joblib.load(os.path.join(base_path, "old_scaler.pkl"))
        
        # Add error handling for tokenizer and model loading
        try:
            tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
            bert_model = DistilBertModel.from_pretrained('distilbert-base-uncased')
        except Exception as e:
            print(f"Error loading BERT models: {str(e)}", file=sys.stderr)
            raise
        
        # Get features
        embedding, numeric_features = prepare_features_traditional2(account_data, tokenizer, bert_model)
        numeric_features_scaled = scaler.transform(numeric_features)
        combined_features = np.concatenate((embedding, numeric_features_scaled), axis=1)
        
        # Make prediction
        prob = xgb_model.predict_proba(combined_features)[0][1]
        threshold = 0.5
        
        return {
            "Predicted_Bot_Label": int(prob > threshold),
            "LR_Probability": float(prob),
            "model_version": "traditional2"
        }
    except Exception as e:
        print(f"Error in predict_bot_traditional2: {str(e)}", file=sys.stderr)
        raise

def predict():
    try:
        data = sys.stdin.read()
        account_data = json.loads(data)
        
        if account_data.get("model_version") == "improved":
            result = predict_bot_improved(account_data)
        else:
            # Default to traditional2 model
            result = predict_bot_traditional2(account_data)
            
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        error_msg = {"error": "Prediction failed", "details": str(e)}
        print(json.dumps(error_msg))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    predict()
