import unittest
import json
from app import app  # Import the Flask app from app.py

class FlaskTestCase(unittest.TestCase):
    
    # Setup the test client
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # Test GET /get
    def test_get_data(self):
        response = self.app.get('/get')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"message": "Hello, World!"})

    # Test POST /post with valid data
    def test_post_data_valid(self):
        response = self.app.post('/post', 
                                 data=json.dumps({"message": "Updated Message"}), 
                                 content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json, {"message": "Updated Message"})

    # Test POST /post with invalid data
    def test_post_data_invalid(self):
        response = self.app.post('/post', 
                                 data=json.dumps({"invalid_key": "No message"}), 
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {"error": "Invalid data"})

if __name__ == '__main__':
    unittest.main()