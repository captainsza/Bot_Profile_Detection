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
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Ensure VADER lexicon is available (quiet download)
nltk.download('vader_lexicon', quiet=True)
sid = SentimentIntensityAnalyzer()

# ----- Utility Functions -----
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

# ----- OLD MODEL (joblib) -----
def load_old_model():
    # Path to the previous model file; adjust folder if needed.
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
        if "Clean_Tweet" in df.columns:
            df["Tweet"] = df["Clean_Tweet"]
        else:
            df["Tweet"] = ""
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

# ----- IMPROVED MODEL (TensorFlow/Keras) -----
def load_improved_model():
    # Adjust paths as needed (assumes improved model, tokenizer and scaler are under modal/)
    model_path = os.path.join(os.path.dirname(__file__), "modal", "improved_bot_detection_model.h5")
    improved_model = tf.keras.models.load_model(model_path, compile=False)
    from transformers import DistilBertTokenizerFast
    tokenizer_path = os.path.join(os.path.dirname(__file__), "modal", "tokenizer")
    tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_path)
    scaler_path = os.path.join(os.path.dirname(__file__), "modal", "scaler.pkl")
    scaler = joblib.load(scaler_path)
    numeric_features = ['Retweet Count', 'Mention Count', 'Follower Count', 'Verified', 'Tweet_Length', 'Hashtag_Count', 'Sentiment']
    max_length = 64
    return improved_model, tokenizer, scaler, numeric_features, max_length

def predict_bot_improved(account_data: dict) -> dict:
    improved_model, tokenizer, scaler, numeric_features, max_length = load_improved_model()
    df = pd.DataFrame([account_data])
    if "Tweet" not in df.columns:
        if "Clean_Tweet" in df.columns:
            df["Tweet"] = df["Clean_Tweet"]
        else:
            df["Tweet"] = ""
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
    encoding = tokenizer(texts, padding="max_length", truncation=True, max_length=max_length, return_tensors="tf")
    input_ids = encoding["input_ids"]
    attention_mask = encoding["attention_mask"]
    num_data = df[numeric_features].values.astype(float)
    num_data_scaled = scaler.transform(num_data)
    
    inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "numeric_input": num_data_scaled
    }
    prob = improved_model.predict(inputs).ravel()[0]
    predicted_label = 1 if prob > 0.5 else 0
    return {
        "Predicted_Bot_Label": predicted_label,
        "LR_Probability": prob,
        "Isolation_Forest_Pred": None,  # Not used in improved model
        "model_version": "improved"
    }

# ----- Main Prediction Function -----
def predict_bot(account_data: dict) -> dict:
    # Use improved model if account_data contains "model_version": "improved"
    version = account_data.get("model_version", "old").lower()
    if version == "improved":
        return predict_bot_improved(account_data)
    else:
        return predict_bot_old(account_data)

def main():
    data = sys.stdin.read()
    try:
        account_data = json.loads(data)
    except Exception as e:
        print(json.dumps({"error": "Invalid input JSON", "details": str(e)}))
        sys.exit(1)
    
    result = predict_bot(account_data)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
