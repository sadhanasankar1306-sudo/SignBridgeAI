"""
SignBridge AI — Machine Learning Pipeline Unit Tests
Compatible with both pytest and python3 -m unittest.
"""

import unittest
from ml.preprocess import extract_landmark_features
from ml.model import ISLClassifier, PythonTemporalSmoother
from ml.dataset import generate_synthetic_benchmark_dataset

class TestMLPipeline(unittest.TestCase):
    def test_feature_extraction_dimension(self):
        mock_lms = [{'x': 0.5 + i * 0.01, 'y': 0.5 + i * 0.01, 'z': 0.0} for i in range(21)]
        feats = extract_landmark_features(mock_lms)
        self.assertIsInstance(feats, list)
        self.assertEqual(len(feats), 73)

    def test_classifier_confidence_and_structure(self):
        classifier = ISLClassifier(min_confidence=0.70)
        mock_feats = [0.0] * 73
        pred = classifier.predict(mock_feats)
        self.assertIn('sign_id', pred)
        self.assertIn('confidence', pred)
        self.assertTrue(0.0 <= pred['confidence'] <= 1.0)
        self.assertIn('is_certain', pred)

    def test_temporal_smoother_rejection(self):
        smoother = PythonTemporalSmoother(window_size=5, min_confidence=0.80)
        low_conf_pred = {
            'sign_id': 'namaste',
            'sign_name': 'Namaste',
            'confidence': 0.55
        }
        res = None
        for _ in range(5):
            res = smoother.push(low_conf_pred)
        self.assertIsNotNone(res)
        self.assertTrue(res['is_uncertain'])
        self.assertFalse(res['is_announce_ready'])

    def test_dataset_signer_isolation(self):
        dataset = generate_synthetic_benchmark_dataset()
        test_signers = {sample['signer'] for sample in dataset['test']}
        train_signers = {sample['signer'] for sample in dataset['train']}
        # Ensure held-out test signer does NOT leak into training set
        self.assertEqual(test_signers, {'Signer_3'})
        self.assertNotIn('Signer_3', train_signers)

if __name__ == '__main__':
    unittest.main()
