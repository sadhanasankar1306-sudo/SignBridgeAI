-- SignBridge AI SQLite Database Schema
-- Provides durable storage for users, saved phrases, and configuration

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'deaf_user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_phrases (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    text TEXT NOT NULL,
    source TEXT NOT NULL CHECK(source IN ('sign', 'speech', 'manual')),
    confidence REAL,
    category TEXT DEFAULT 'General',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    text_scale TEXT DEFAULT 'normal',
    high_contrast INTEGER DEFAULT 0,
    reduced_motion INTEGER DEFAULT 0,
    min_confidence_threshold REAL DEFAULT 0.70,
    temporal_smoothing_frames INTEGER DEFAULT 7,
    auto_speak_confirmed INTEGER DEFAULT 0,
    tts_rate REAL DEFAULT 1.0,
    tts_pitch REAL DEFAULT 1.0,
    sound_cue_on_recognition INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_phrases_user ON saved_phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_phrases_created ON saved_phrases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phrases_source ON saved_phrases(source);
