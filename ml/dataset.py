"""
SignBridge AI — ISL Benchmark Dataset Generator & Split Manager
Supports standard library random for zero-dependency execution.
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Any
from ml.preprocess import extract_landmark_features

LABELS_PATH = Path(__file__).resolve().parent / 'labels.json'

def load_labels() -> List[Dict[str, Any]]:
    with open(LABELS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_synthetic_benchmark_dataset(
    samples_per_signer: int = 30,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Generates synthetic landmark dataset partitioned by Signer ID (Signer 1, Signer 2, Signer 3)
    to reflect real signer-independent held-out evaluation requirements.
    - Signer 1 & 2: Train + Validation
    - Signer 3: Held-out Test set (strictly isolated)
    """
    random.seed(seed)
    labels = load_labels()
    sign_ids = [s['id'] for s in labels]

    dataset = {
        'metadata': {
            'corpus': 'ISL-CSLTR Synthetic Landmark Benchmark',
            'signers': ['Signer_1', 'Signer_2', 'Signer_3'],
            'classes': sign_ids,
            'classes_count': len(sign_ids)
        },
        'train': [],
        'val': [],
        'test': []
    }

    for sign in labels:
        s_id = sign['id']
        for signer_idx, signer_name in enumerate(['Signer_1', 'Signer_2', 'Signer_3']):
            signer_jitter = (signer_idx - 1) * 0.03

            for sample_i in range(samples_per_signer):
                landmarks = []
                for pt_idx in range(21):
                    x = 0.5 + signer_jitter + random.gauss(0, 0.02)
                    y = 0.6 + random.gauss(0, 0.02)
                    z = random.gauss(0, 0.01)
                    landmarks.append({'x': float(x), 'y': float(y), 'z': float(z)})

                features = extract_landmark_features(landmarks)

                sample_entry = {
                    'sign_id': s_id,
                    'signer': signer_name,
                    'features': features
                }

                if signer_name == 'Signer_3':
                    dataset['test'].append(sample_entry)
                elif sample_i < int(samples_per_signer * 0.8):
                    dataset['train'].append(sample_entry)
                else:
                    dataset['val'].append(sample_entry)

    return dataset
