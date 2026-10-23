import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  SUPPORTED_SIGNS,
  predictSign,
  getResearchEvaluation,
  type RawLandmarksInput
} from './ml/model.ts';
import type { SavedPhrase, UserPreferences, UserProfile } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security and request size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Database directory setup for durable storage
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: (UserProfile & { passwordHash: string })[];
  history: SavedPhrase[];
  preferences: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  textScale: 'normal',
  highContrast: false,
  reducedMotion: false,
  minConfidenceThreshold: 0.70,
  temporalSmoothingFrames: 7,
  autoSpeakConfirmed: false,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  soundCueOnRecognition: true
};

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading DB file, reinitializing:', err);
  }

  // Initial seed phrases
  const initialDb: DatabaseSchema = {
    users: [
      {
        id: 'usr_guest',
        email: 'researcher@signbridge.ai',
        name: 'ISL Research Fellow',
        role: 'researcher',
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' // 'admin' sha256 simulation
      }
    ],
    history: [
      {
        id: 'phrase_1',
        text: 'Namaste, happy to meet you today.',
        category: 'Greetings',
        source: 'sign',
        confidence: 0.967,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        notes: 'Verified gesture at chest'
      },
      {
        id: 'phrase_2',
        text: 'Can you please guide me to the clinic reception?',
        category: 'Essential',
        source: 'speech',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        id: 'phrase_3',
        text: 'Thank you for your assistance.',
        category: 'Courtesy',
        source: 'sign',
        confidence: 0.933,
        createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString()
      }
    ],
    preferences: DEFAULT_PREFERENCES
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// Ensure DB exists
readDb();

/* ==========================================================================
   REST API ENDPOINTS
   ========================================================================== */

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'SignBridge AI Core Engine',
    timestamp: new Date().toISOString()
  });
});

// 2. Model status & capabilities
app.get('/api/model/status', (_req, res) => {
  res.json({
    loaded: true,
    modelName: 'ISL-MLP Landmark Geometry Classifier',
    modelVersion: 'v2.4-TemporalSmoothed',
    framework: 'MediaPipe Vision + Normalized Geometry Softmax Engine',
    classesCount: SUPPORTED_SIGNS.length,
    inputDimension: 73,
    minConfidenceThresholdDefault: 0.70,
    supportedSigns: SUPPORTED_SIGNS.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      twoHanded: s.twoHanded
    }))
  });
});

// 3. Supported signs library
app.get('/api/signs', (req, res) => {
  const { category, search } = req.query;
  let signs = [...SUPPORTED_SIGNS];

  if (category && typeof category === 'string' && category !== 'All') {
    signs = signs.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    signs = signs.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.verifiedMeaning.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }

  res.json({
    count: signs.length,
    total: SUPPORTED_SIGNS.length,
    signs
  });
});

// 4. Single sign details
app.get('/api/signs/:id', (req, res) => {
  const sign = SUPPORTED_SIGNS.find(s => s.id === req.params.id);
  if (!sign) {
    return res.status(404).json({ error: 'Sign not found in current model vocabulary' });
  }
  res.json(sign);
});

// 5. Sign Recognition endpoint (processes landmark coordinates)
app.post('/api/recognize', (req, res) => {
  try {
    const { landmarks, handedness, minConfidenceThreshold } = req.body as RawLandmarksInput & {
      minConfidenceThreshold?: number;
    };

    if (!landmarks || !Array.isArray(landmarks)) {
      return res.status(400).json({
        error: 'Invalid payload: landmarks must be an array of {x, y, z} points.'
      });
    }

    const threshold = typeof minConfidenceThreshold === 'number'
      ? Math.max(0.4, Math.min(0.95, minConfidenceThreshold))
      : 0.70;

    const result = predictSign({ landmarks, handedness }, threshold);
    return res.json(result);
  } catch (err) {
    console.error('Inference error:', err);
    return res.status(500).json({ error: 'Inference pipeline failure' });
  }
});

// 6. History / Saved Phrases endpoints
app.get('/api/history', (req, res) => {
  const db = readDb();
  const { search, source } = req.query;
  let list = [...db.history];

  if (source && typeof source === 'string') {
    list = list.filter(h => h.source === source);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(h =>
      h.text.toLowerCase().includes(q) ||
      (h.category && h.category.toLowerCase().includes(q)) ||
      (h.notes && h.notes.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    count: list.length,
    items: list
  });
});

app.post('/api/history', (req, res) => {
  const { text, source, confidence, category, notes } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text cannot be empty' });
  }

  const db = readDb();
  const newPhrase: SavedPhrase = {
    id: `phrase_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    text: text.trim(),
    source: source === 'sign' || source === 'speech' ? source : 'manual',
    confidence: typeof confidence === 'number' ? confidence : undefined,
    category: category || 'Conversation',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.history.unshift(newPhrase);
  writeDb(db);

  res.status(201).json(newPhrase);
});

app.delete('/api/history/:id', (req, res) => {
  const db = readDb();
  const index = db.history.findIndex(h => h.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Phrase not found' });
  }

  const removed = db.history.splice(index, 1)[0];
  writeDb(db);
  res.json({ success: true, removed });
});

app.delete('/api/history', (_req, res) => {
  const db = readDb();
  const count = db.history.length;
  db.history = [];
  writeDb(db);
  res.json({ success: true, clearedCount: count });
});

// 7. Research Evaluation endpoint
app.get('/api/evaluation', (_req, res) => {
  const results = getResearchEvaluation();
  res.json(results);
});

// 8. CSV Export for research evaluation
app.get('/api/evaluation/export', (_req, res) => {
  const evalData = getResearchEvaluation();
  const lines: string[] = [];

  // Header metadata
  lines.push('# SignBridge AI Research Evaluation Report');
  lines.push(`# Model: ${evalData.modelName} ${evalData.modelVersion}`);
  lines.push(`# Dataset: ${evalData.datasetName} (Total: ${evalData.datasetSize}, Test: ${evalData.testSamples})`);
  lines.push(`# Evaluation Date: ${evalData.evaluationDate}`);
  lines.push(`# Overall Top-1 Accuracy: ${(evalData.top1Accuracy * 100).toFixed(2)}%`);
  lines.push(`# Macro Precision: ${(evalData.macroPrecision * 100).toFixed(2)}%`);
  lines.push(`# Macro Recall: ${(evalData.macroRecall * 100).toFixed(2)}%`);
  lines.push(`# Macro F1-Score: ${(evalData.macroF1 * 100).toFixed(2)}%`);
  lines.push('');

  // Per-class metrics table
  lines.push('Sign ID,Sign Name,Precision,Recall,F1-Score,Test Support');
  for (const m of evalData.perClassMetrics) {
    lines.push(`${m.signId},"${m.signName}",${m.precision.toFixed(4)},${m.recall.toFixed(4)},${m.f1Score.toFixed(4)},${m.support}`);
  }
  lines.push('');

  // Confidence Threshold Curve
  lines.push('Confidence Threshold (Tau),Test Accuracy,Rejection Rate');
  for (const c of evalData.confidenceThresholdCurve) {
    lines.push(`${c.threshold.toFixed(2)},${c.accuracy.toFixed(4)},${c.rejectionRate.toFixed(4)}`);
  }
  lines.push('');

  // Baseline Comparison
  lines.push('Architecture Model,Top-1 Accuracy,Macro F1,False Announcement Rate,Inference Latency (ms)');
  for (const b of evalData.baselineComparison) {
    lines.push(`"${b.model}",${b.top1Accuracy.toFixed(4)},${b.macroF1.toFixed(4)},${b.falseAnnouncementRate.toFixed(4)},${b.latencyMs.toFixed(1)}`);
  }

  const csv = lines.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="signbridge_research_evaluation.csv"');
  res.send(csv);
});

// 9. User preferences
app.get('/api/preferences', (_req, res) => {
  const db = readDb();
  res.json(db.preferences || DEFAULT_PREFERENCES);
});

app.post('/api/preferences', (req, res) => {
  const db = readDb();
  db.preferences = { ...DEFAULT_PREFERENCES, ...(db.preferences || {}), ...req.body };
  writeDb(db);
  res.json(db.preferences);
});

// 10. Simple Auth endpoints (for research session tracking)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or credentials' });
  }

  // Simulated password match
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token: `token_${Date.now()}`
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = readDb();
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (exists) {
    return res.status(409).json({ error: 'User already exists with this email address' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email: email.trim(),
    name: name.trim(),
    role: role || 'deaf_user',
    passwordHash: 'dummy_hash'
  };

  db.users.push(newUser);
  writeDb(db);

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    },
    token: `token_${Date.now()}`
  });
});

app.get('/api/auth/me', (_req, res) => {
  const db = readDb();
  const user = db.users[0] || {
    id: 'usr_guest',
    email: 'guest@signbridge.ai',
    name: 'Research Guest',
    role: 'guest'
  };
  res.json({ user });
});

/* ==========================================================================
   Vite Middleware / Static Files
   ========================================================================== */

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SignBridge AI] Fullstack Server running on http://0.0.0.0:${PORT}`);
    console.log(`[SignBridge AI] Mode: ${isProduction ? 'Production' : 'Development with Vite middleware'}`);
    console.log(`[SignBridge AI] Loaded ${SUPPORTED_SIGNS.length} supported ISL signs.`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
