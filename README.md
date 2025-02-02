# 🤖 Bot Profile Detection

<div align="center">

![Bot Detection Demo](assets/demo.gif)

A cutting-edge system for detecting AI-powered bot accounts on social media platforms using dual model approaches. Winner of the Social Media Bot Detection Hackathon 2024.

[![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.0+-orange?style=for-the-badge&logo=tensorflow)](https://tensorflow.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Live Demo](http://202.71.184.6:3001/) · [Documentation](docs/README.md)

</div>

## 🎯 Problem Statement

Modern social media platforms face increasing challenges from sophisticated bot accounts that:
- Spread misinformation and spam content
- Manipulate public discussions
- Generate AI-powered content
- Replicate human-like behavior

Traditional rule-based detection methods often fail against these advanced bots. Our solution leverages state-of-the-art ML/DL techniques to identify automated accounts effectively.

![Architecture Overview](assets/architecture.png)

## 🌟 Key Features

### Advanced Detection Models
- **Dual Model Architecture**
  - 🔄 Traditional: Logistic Regression + Isolation Forest (.pkl)
  - 🧠 Advanced: Multi-modal Neural Network with DistilBERT (.h5)
  
### Real-time Analysis
- ⚡ Process thousands of posts in real-time
- 📊 Live probability scoring
- 🎯 Anomaly detection in user behavior

### Comprehensive Feature Analysis
![Feature Analysis](assets/features.gif)
- 📝 Text-based features (BERT embeddings)
- 📈 Behavioral patterns
- 🔄 Engagement metrics
- #️⃣ Hashtag analysis

### Modern UI/UX
- 🎨 Sleek, responsive design
- 📱 Mobile-friendly interface
- 📊 Interactive visualizations
- 🌗 Dark mode support

## 📁 Project Structure

```
Bot_Profile_Detection/
├── notebooks/
│   ├── traditional_model_training.ipynb
│   └── improved_model_training.ipynb
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── predict/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── model/
│   │   ├── bot_detection_model.pkl
│   │   ├── improved_bot_detection_model.h5
│   │   ├── scaler.pkl
│   │   └── tokenizer/
│   ├── predict.py
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🔧 Prerequisites

- Python 3.10 or later (but below 3.13)
- Node.js 16.0 or higher
- npm or yarn package manager

## 🚀 Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Bot_Profile_Detection.git
cd Bot_Profile_Detection
```

2. Set up Python environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Ubuntu Server Deployment

1. Connect to your Ubuntu server:
```bash
ssh username@202.71.184.6
```

2. Install system dependencies:
```bash
sudo apt update
sudo apt install python3-venv nodejs npm
```

3. Clone and setup the project:
```bash
git clone https://github.com/yourusername/Bot_Profile_Detection.git
cd Bot_Profile_Detection
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. Install Node.js dependencies and build:
```bash
cd frontend
npm install
npm run build
```

5. Start the production server:
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start npm --name "bot-detection" -- start

# Or using regular npm
npm start
```

The application will be available at `http://202.71.184.6:3001/`

## Additional Setup Instructions

1. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   Make sure to include packages like:
   - transformers
   - tensorflow
   - scikit-learn
   - nltk

3. Download the NLTK VADER lexicon if not already available:
   ```bash
   python -c "import nltk; nltk.download('vader_lexicon')"
   ```

4. (Optional) Place or verify the model files in:
   ```
   frontend/
     modal/
       bot_detection_model.pkl
       improved_bot_detection_model.h5
       scaler.pkl
       tokenizer/
   ```

5. Run the Next.js frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   This starts the development server at http://localhost:3000.

6. Testing the endpoints:
   - You can POST JSON input to /api/predict with fields like:
     ```json
     {
       "Tweet": "Sample text",
       "Retweet Count": "10",
       "Mention Count": "2",
       "Follower Count": "100",
       "Verified": 0,
       "Hashtags": "",
       "model_version": "improved"
     }
     ```
   - The Python script in predict.py will process the request and return a JSON response with predicted labels.

## 💻 Usage

### Access Options

1. **Live Demo**: Visit [http://202.71.184.6:3001/](http://202.71.184.6:3001/)

2. **Local Development**:
```bash
cd frontend
npm run dev
# Access at http://localhost:3000
```

3. Enter profile data and select model version:
   - Traditional: Uses .pkl model for faster, lightweight predictions
   - Improved: Uses neural network for higher accuracy

## 🔍 Currently deployed Reference

### Prediction Endpoint

```http
# Live
POST http://202.71.184.6:3001/api/predict

# Local Development
POST http://localhost:3000/api/predict
```

Request body:
```json
{
  "text": "Sample tweet text",
  "followers": 100,
  "following": 150,
  "model_version": "improved"
}
```

Response:
```json
{
  "probability": 0.85,
  "is_bot": true,
  "confidence": "high",
  "explanation": "Analysis suggests bot-like behavior..."
}
```

## 🎮 Demo

### Traditional Model
![Traditional Model Demo](assets/traditional-demo.gif)

### Improved Neural Network
![Neural Network Demo](assets/neural-demo.gif)

## 📊 Performance Metrics

| Model | Precision | Recall | F1 Score | AUC-ROC |
|-------|-----------|--------|----------|---------|
| Traditional | 0.89 | 0.92 | 0.90 | 0.94 |
| Improved | 0.95 | 0.96 | 0.95 | 0.98 |

## 🛠️ Technical Architecture

```mermaid
graph TD
    A[Frontend - Next.js] --> B[API Layer]
    B --> C[Model Selector]
    C --> D[Traditional Model]
    C --> E[Neural Network]
    D --> F[Result Aggregator]
    E --> F
    F --> B
```

### Models

1. **Traditional Model**
   - 🔍 Logistic Regression + Isolation Forest
   - 📊 Feature engineering using NLTK
   - 💾 Compact .pkl format (~50MB)
   - ⚡ Fast inference time: ~100ms

2. **Improved Model**
   - 🧠 Multi-modal Neural Network
   - 🔤 DistilBERT embeddings
   - 📈 Custom architecture
   - 🎯 Higher accuracy: 95%+

### Frontend

- Next.js 13+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ApexCharts for visualizations
- Framer Motion for animations

## 🛠️ Deployment Notes

### Server Requirements
- Ubuntu 20.04 or later
- Python 3.10+ (but below 3.13)
- Node.js 16.0+
- 4GB RAM minimum
- 20GB storage

### Common Issues

1. **Model Loading Issues**
   ```bash
   # Fix permissions for model files
   chmod 644 frontend/modal/*.{pkl,h5}
   chmod 755 frontend/modal/tokenizer
   ```

2. **TensorFlow Warnings**
   - Add to your environment:
   ```bash
   export TF_CPP_MIN_LOG_LEVEL='2'
   ```

3. **Port Configuration**
   - Default port: 3001
   - Configure in next.config.js:
   ```js
   module.exports = {
     ...config,
     port: 3001
   }
   ```

### Monitoring

Monitor your deployment using PM2:
```bash
pm2 status
pm2 logs bot-detection
pm2 monit
```

## 📈 Future Roadmap

- [ ] Multi-platform support (Instagram, LinkedIn)
- [ ] Real-time streaming analytics
- [ ] API rate limiting and caching
- [ ] Automated model retraining
- [ ] Federated learning support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🙏 Acknowledgments

- TensorFlow team
- Hugging Face Transformers
- Next.js community
- Tailwind CSS
- Framer Motion
- ApexCharts

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/Bot_Profile_Detection&type=Date)](https://star-history.com/#yourusername/Bot_Profile_Detection&Date)

## 📸 Screenshots

<div align="center">
<img src="assets/Evaluation-advance-model.png" width="400"/> <img src="assets/1.png" width="400"/>
</div>

## 📫 Contact

For questions or feedback, please open an issue in the repository.
