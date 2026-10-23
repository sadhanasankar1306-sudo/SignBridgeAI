"""
SignBridge AI — Indian Sign Language Feature Extraction & Landmark Preprocessing
Supports standard Python standard library (math) as well as NumPy when present.
"""

import math
from typing import List, Dict, Any, Union

def euclidean_dist(p1: Dict[str, float], p2: Dict[str, float]) -> float:
    dx = p1.get('x', 0.0) - p2.get('x', 0.0)
    dy = p1.get('y', 0.0) - p2.get('y', 0.0)
    dz = p1.get('z', 0.0) - p2.get('z', 0.0)
    return math.sqrt(dx * dx + dy * dy + dz * dz)

def extract_landmark_features(landmarks: List[Dict[str, float]]) -> List[float]:
    """
    Normalizes 21 3D MediaPipe hand landmarks:
    1. Origin translation to wrist (landmark 0)
    2. Scale normalization by palm scale (wrist to middle MCP distance)
    3. 10 geometric extension & fingertip spread ratios
    Total: 63 normalized coordinates + 10 geometric features = 73-dim vector
    """
    if not landmarks or len(landmarks) < 21:
        return [0.0] * 73

    wrist = landmarks[0]
    middle_mcp = landmarks[9]
    palm_scale = euclidean_dist(wrist, middle_mcp)
    if palm_scale <= 1e-6:
        palm_scale = 1.0

    normalized_coords: List[float] = []
    for lm in landmarks[:21]:
        normalized_coords.extend([
            (lm.get('x', 0.0) - wrist.get('x', 0.0)) / palm_scale,
            (lm.get('y', 0.0) - wrist.get('y', 0.0)) / palm_scale,
            (lm.get('z', 0.0) - wrist.get('z', 0.0)) / palm_scale,
        ])

    # Finger extension ratios (tip to wrist vs mcp to wrist)
    thumb_ext = euclidean_dist(landmarks[4], wrist) / max(euclidean_dist(landmarks[2], wrist), 1e-4)
    index_ext = euclidean_dist(landmarks[8], wrist) / max(euclidean_dist(landmarks[5], wrist), 1e-4)
    middle_ext = euclidean_dist(landmarks[12], wrist) / max(euclidean_dist(landmarks[9], wrist), 1e-4)
    ring_ext = euclidean_dist(landmarks[16], wrist) / max(euclidean_dist(landmarks[13], wrist), 1e-4)
    pinky_ext = euclidean_dist(landmarks[20], wrist) / max(euclidean_dist(landmarks[17], wrist), 1e-4)

    # Inter-finger spreads
    spread_ti = euclidean_dist(landmarks[4], landmarks[8]) / palm_scale
    spread_im = euclidean_dist(landmarks[8], landmarks[12]) / palm_scale
    spread_mr = euclidean_dist(landmarks[12], landmarks[16]) / palm_scale
    spread_rp = euclidean_dist(landmarks[16], landmarks[20]) / palm_scale
    spread_tp = euclidean_dist(landmarks[4], landmarks[20]) / palm_scale

    geometric = [
        thumb_ext, index_ext, middle_ext, ring_ext, pinky_ext,
        spread_ti, spread_im, spread_mr, spread_rp, spread_tp
    ]

    return normalized_coords + geometric
