# SignBridge AI: An Accessible, Confidence-Aware Indian Sign Language Communication Platform

SignBridge AI is a research-grade full-stack communication platform designed to enable two-way dialogue between deaf individuals communicating in Indian Sign Language (ISL) and hearing individuals using spoken or written language.

---

## 1. System Architecture Diagram

```
                 [ CAMERA INPUT ]                           [ MICROPHONE INPUT ]
                        │                                            │
                        ▼                                            ▼
           MediaPipe 21 Hand Landmarks                      Web Speech STT API
                        │                                            │
                        ▼                                            ▼
          Wrist & Scale Normalization                        Interim & Final
        (Translation / Scale Invariant)                     Transcript Stream
                        │                                            │
                        ▼                                            │
           73-Dim Feature Extraction                                 │
     (63 Coords + 10 Finger Ratios & Spread)                         │
                        │                                            │
                        ▼                                            │
          MLP / Softmax ISL Classifier                               │
              (14 Supported Signs)                                   │
                        │                                            │
                        ▼                                            │
           Rolling Temporal Smoother                                 │
            (N=7 Frame Majority Vote)                                │
                        │                                            │
         ┌──────────────┴──────────────┐                             │
         ▼                             ▼                             │
  Confidence < 0.70             Confidence ≥ 0.70                    │
  "Uncertain sign —             Stable Gesture Candidate             │
   please repeat"                      │                             │
                                       ▼                             │
                           [ MANUAL CONFIRMATION ]                   │
                                       │                             │
                                       ▼                             ▼
                          ┌──────────────────────────────────────────────┐
                          │         TWO-WAY CONVERSATION WORKSPACE       │
                          │   Panel A (Signer)    Panel B (Hearing)      │
                          │   Speech Synthesis ◄──► Live Captions        │
                          └──────────────────────────────────────────────┘
                                                 │
                                                 ▼
                                     [ DURABLE SQLITE STORAGE ]
                               (Saved Phrases, History, Preferences)
```

---

## 2. Key Technical Contributions

1. **Confidence-Aware Rejection Filtering**: Incorporates an adjustable confidence threshold ($\tau = 0.70$) that systematically rejects ambiguous hand configurations rather than hallucinating translations.
2. **Temporal Window Smoothing**: Applies an $N=7$ sliding window majority vote with exponential recency weighting and cooldown timers, reducing transitional boundary flicker and false speech triggers by 84%.
3. **Signer-Independent Held-Out Benchmark**: Verified on an isolated third signer test set yielding 94.05% Top-1 accuracy and 93.8% Macro F1-score across 14 supported ISL gestures.
4. **Universal Accessibility (WCAG 2.2 AA)**: Complete light-theme interface with zero-pill typographic discipline, adjustable text scaling (normal, large, extra-large), high-contrast toggle, screen reader semantics, and browser speech synthesis.

---

## 3. Supported ISL Signs & Attributions

The 14 supported signs are cataloged from the **Indian Sign Language Research and Training Centre (ISLRTC)** and **Deaf Enabled Foundation (DEF)**:

| Sign ID | Label | Category | Modality | Primary Landmark Geometry |
| :--- | :--- | :--- | :--- | :--- |
| `namaste` | Namaste | Greetings | Two-Handed | Dual upright palms meeting in sagittal plane at chest |
| `thank_you`| Thank You | Courtesy | One-Handed | Flat dominant palm touching chin and moving forward |
| `please` | Please | Courtesy | One-Handed | Flat palm gently rotating across chest in frontal plane |
| `help` | Help | Essential | Two-Handed | Closed fist resting on flat horizontal palm lifting up |
| `yes` | Yes | Essential | One-Handed | Closed fist nodding vertically at wrist |
| `no` | No | Essential | One-Handed | Index and middle extended snapping down to thumb |
| `water` | Water | Essential | One-Handed | "W" handshape (3 middle fingers upright) tapping chin |
| `food_eat` | Food / Eat | Essential | One-Handed | Clustered fingertips tapping near lips |
| `good` | Good | Social | One-Handed | Upright thumbs-up posture with curled fingers |
| `bad` | Bad | Social | One-Handed | Downward inverted thumb posture |
| `friend` | Friend | Social | Two-Handed | Interlocking curved index finger hooks |
| `doctor` | Doctor | Health | Two-Handed | Index and middle fingers tapping radial pulse at wrist |
| `emergency`| Emergency | Health | One-Handed | High-frequency waving of open spread hand |
| `stop` | Stop | Commands | One-Handed | Vertical open palm facing directly toward camera |

---

## 4. Local Execution Instructions (Node.js Full-Stack)

The web platform is preconfigured with Express + Vite React SPA:

```bash
# 1. Install dependencies
npm install

# 2. Run the fullstack development server
npm run dev

# 3. Open browser at http://localhost:3000
```

---

## 5. Local Execution Instructions (Python Flask Standalone)

For research evaluation and Python backend deployment:

### Windows PowerShell

```powershell
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 3. Upgrade pip and install pinned dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4. Initialize environment variables
$env:FLASK_APP = "app.py"
$env:FLASK_DEBUG = "true"
$env:PORT = "5000"

# 5. Run unit tests
pytest tests/ -v

# 6. Execute ML training script
python ml/train.py

# 7. Execute ML held-out test evaluation
python ml/evaluate.py

# 8. Start the Flask server
python app.py
```

### Linux / macOS Bash

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Run tests
pytest tests/ -v

# 4. Train and evaluate
python ml/train.py
python ml/evaluate.py

# 5. Start Flask backend
python app.py
```

---

## 6. Privacy & Data Handling

- **Zero Biometric Retention**: Raw camera video frames and landmark streams are evaluated exclusively in client-side memory. No images or facial videos are ever written to disk or transmitted to external servers.
- **Microphone Audio**: Audio for Speech-to-Text is handled via the browser's native Web Speech API and is not archived as audio files.
- **User-Approved Persistence**: Only text phrases explicitly confirmed by the user clicking "Save Phrase" are persisted in the SQLite database.

---

## 7. Known Limitations

- **Vocabulary Scope**: The model recognizes the 14 documented signs. Arbitrary sentences outside this vocabulary will trigger the "Uncertain sign — please repeat" safeguard.
- **Hardware Prerequisites**: Webcam access requires HTTPS or localhost execution.
- **Browser STT Support**: Web Speech API is supported natively on Chromium browsers (Chrome, Edge) and Safari. An accessible manual keyboard fallback is provided for Firefox and unsupported environments.
