#!/usr/bin/env python3
import sys
import json
import joblib
import pandas as pd
import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Ensure VADER lexicon is available (quiet download)
nltk.download('vader_lexicon', quiet=True)

# Load the ensemble model (adjust the path if your file is elsewhere)
model_file = "./modal/bot_detection_model.pkl"
ensemble_model = joblib.load(model_file)
clf_pipeline = ensemble_model["clf_pipeline"]
iso_pipeline = ensemble_model["iso_pipeline"]
text_feature = ensemble_model["text_feature"]
numeric_features = ensemble_model["numeric_features"]
threshold = ensemble_model["threshold"]

sid = SentimentIntensityAnalyzer()

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
    hashtags = [tag for tag in hashtags if tag != ""]
    return len(hashtags)

def predict_bot(account_data: dict) -> dict:
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
        "Isolation_Forest_Pred": iso_prediction_binary
    }

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
