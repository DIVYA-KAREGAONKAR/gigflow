from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
CORS(app)

# Add this to app.py on Hugging Face
@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "GigFlow AI Service is Online"})

@app.route('/match', methods=['POST'])
def match():
    data = request.json
    user_skills = data.get('user_skills', '')
    gig_skills = data.get('gig_skills', '')

    if not user_skills or not gig_skills:
        return jsonify({"score": 0})

    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform([user_skills, gig_skills])
    score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    
    return jsonify({"score": int(score * 100)})

if __name__ == '__main__':
    # HF Spaces uses port 7860 by default
    app.run(host='0.0.0.0', port=7860)