import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'signbridge-dev-secret-key-2026-v2')
    DATABASE_PATH = os.environ.get('DATABASE_PATH', str(BASE_DIR / 'data' / 'signbridge.sqlite'))
    MIN_CONFIDENCE_THRESHOLD = float(os.environ.get('MIN_CONFIDENCE_THRESHOLD', '0.70'))
    TEMPORAL_WINDOW_SIZE = int(os.environ.get('TEMPORAL_WINDOW_SIZE', '7'))
    COOLDOWN_MS = int(os.environ.get('COOLDOWN_MS', '1200'))
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', '5000'))
    DEBUG = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
