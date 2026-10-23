"""
SignBridge AI — Model Evaluation & Metric Calculation Script
"""

import json
import csv
from pathlib import Path
from ml.dataset import generate_synthetic_benchmark_dataset, load_labels
from ml.model import ISLClassifier

def evaluate_on_test_set():
    print("[SignBridge AI] Evaluating model on held-out test split...")
    dataset = generate_synthetic_benchmark_dataset()
    test_set = dataset['test']

    classifier = ISLClassifier(min_confidence=0.70)
    labels = load_labels()
    label_ids = [s['id'] for s in labels]

    total = len(test_set)
    correct = 0
    per_class_total = {lid: 0 for lid in label_ids}
    per_class_correct = {lid: 0 for lid in label_ids}

    for sample in test_set:
        actual = sample['sign_id']
        features = sample['features']
        per_class_total[actual] = per_class_total.get(actual, 0) + 1

        pred = classifier.predict(features)
        if pred['sign_id'] == actual:
            correct += 1
            per_class_correct[actual] = per_class_correct.get(actual, 0) + 1

    accuracy = correct / max(total, 1)

    print(f"\n================ EVALUATION SUMMARY ================")
    print(f"Total Test Samples: {total}")
    print(f"Top-1 Accuracy:     {accuracy * 100:.2f}%")
    print(f"Per-Class Performance Breakdown:")
    for lid in label_ids:
        c_tot = per_class_total.get(lid, 0)
        c_cor = per_class_correct.get(lid, 0)
        rec = c_cor / max(c_tot, 1)
        print(f"  - {lid:14s}: {c_cor:2d}/{c_tot:2d} ({rec * 100:5.1f}%)")

    # Save CSV
    out_csv = Path(__file__).resolve().parent / 'evaluation_results.csv'
    with open(out_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Sign ID', 'Correct', 'Total', 'Recall'])
        for lid in label_ids:
            c_tot = per_class_total.get(lid, 0)
            c_cor = per_class_correct.get(lid, 0)
            writer.writerow([lid, c_cor, c_tot, round(c_cor / max(c_tot, 1), 4)])

    print(f"\n[SignBridge AI] Results exported to {out_csv}")

if __name__ == '__main__':
    evaluate_on_test_set()
