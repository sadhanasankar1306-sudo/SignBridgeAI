"""
SignBridge AI — Backend Unit Tests
Compatible with both pytest and python3 -m unittest.
"""

import unittest
import json
import urllib.request
import urllib.error

class TestBackendEndpoints(unittest.TestCase):
    def test_live_node_backend_health(self):
        try:
            req = urllib.request.Request('http://localhost:3000/api/health')
            with urllib.request.urlopen(req, timeout=3) as response:
                self.assertEqual(response.status, 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertEqual(data.get('status'), 'ok')
        except urllib.error.URLError:
            self.skipTest("Live server not running on port 3000")

    def test_live_node_model_status(self):
        try:
            req = urllib.request.Request('http://localhost:3000/api/model/status')
            with urllib.request.urlopen(req, timeout=3) as response:
                self.assertEqual(response.status, 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertTrue(data.get('loaded'))
                self.assertEqual(data.get('classesCount'), 14)
        except urllib.error.URLError:
            self.skipTest("Live server not running on port 3000")

    def test_live_node_signs_catalog(self):
        try:
            req = urllib.request.Request('http://localhost:3000/api/signs')
            with urllib.request.urlopen(req, timeout=3) as response:
                self.assertEqual(response.status, 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertEqual(data.get('count'), 14)
                self.assertEqual(len(data.get('signs', [])), 14)
        except urllib.error.URLError:
            self.skipTest("Live server not running on port 3000")

if __name__ == '__main__':
    unittest.main()
