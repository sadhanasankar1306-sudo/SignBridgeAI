"""
SignBridge AI — Flask Web Application Entry Point
"""

import os
import sqlite3
import json
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS
from config import Config
from ml.model import ISLClassifier, PythonTemporalSmoother
from ml.preprocess import extract_landmark_features

app = Flask(__name__, static_folder='dist', static_url_path='/')
app.config.from_object(Config)
CORS(app)

classifier = ISLClassifier(min_confidence=app.config['MIN_CONFIDENCE_THRESHOLD'])
smoother = PythonTemporalSmoother(
    window_size=app.config['TEMPORAL_WINDOW_SIZE'],
    cooldown_ms=app.config['COOLDOWN_MS'],
    min_confidence=app.config['MIN_CONFIDENCE_THRESHOLD']
)

def init_sqlite():
    db_path = Path(app.config['DATABASE_PATH'])
    db_path.parent.mkdir(parents=True, exist_ok=True)
    schema_path = Path(__file__).resolve().parent / 'database' / 'schema.sql'

    conn = sqlite3.connect(db_path)
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

try:
    init_sqlite()
except Exception as e:
    print(f"[SignBridge AI] SQLite initialization note: {e}")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'SignBridge AI Python Flask Backend',
        'framework': 'Flask + MediaPipe + Scikit-Learn'
    })

@app.route('/api/model/status', methods=['GET'])
def model_status():
    labels_file = Path(__file__).resolve().parent / 'ml' / 'labels.json'
    with open(labels_file, 'r', encoding='utf-8') as f:
        labels = json.load(f)

    return jsonify({
        'loaded': True,
        'modelName': 'ISL-MLP Landmark Geometry Classifier',
        'version': 'v2.4-TemporalSmoothed',
        'classesCount': len(labels),
        'supportedSigns': [{'id': s['id'], 'name': s['name'], 'category': s['category']} for s in labels]
    })

@app.route('/api/signs', methods=['GET'])
def get_signs():
    labels_file = Path(__file__).resolve().parent / 'ml' / 'labels.json'
    with open(labels_file, 'r', encoding='utf-8') as f:
        labels = json.load(f)

    category = request.args.get('category')
    search = request.args.get('search')

    filtered = labels
    if category and category != 'All':
        filtered = [s for s in filtered if s['category'].lower() == category.lower()]
    if search:
        q = search.lower()
        filtered = [s for s in filtered if q in s['name'].lower() or q in s['verifiedMeaning'].lower()]

    return jsonify({
        'count': len(filtered),
        'total': len(labels),
        'signs': filtered
    })

@app.route('/api/recognize', methods=['POST'])
def recognize():
    data = request.get_json() or {}
    landmarks = data.get('landmarks', [])
    threshold = float(data.get('minConfidenceThreshold', app.config['MIN_CONFIDENCE_THRESHOLD']))

    if not landmarks or len(landmarks) < 21:
        return jsonify({
            'signId': 'none',
            'signName': 'No Hand Detected',
            'confidence': 0.0,
            'isCertain': False
        })

    features = extract_landmark_features(landmarks)
    pred = classifier.predict(features)
    smoothed = smoother.push(pred)

    return jsonify({
        'signId': pred['sign_id'],
        'signName': pred['sign_name'],
        'confidence': pred['confidence'],
        'isCertain': pred['is_certain'],
        'smoothed': smoothed
    })

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    dist_dir = Path(__file__).resolve().parent / 'dist'
    if dist_dir.exists() and (dist_dir / path).exists() and path != '':
        return send_from_directory(dist_dir, path)
    if dist_dir.exists() and (dist_dir / 'index.html').exists():
        return send_from_directory(dist_dir, 'index.html')
    return jsonify({
        'service': 'SignBridge AI Python Backend Running',
        'frontend': 'Run npm run dev or vite build to generate frontend bundle'
    })

if __name__ == '__main__':
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
