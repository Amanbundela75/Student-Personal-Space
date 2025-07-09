# app.py - Simple Flask API for Face Recognition
from flask import Flask, request, jsonify
import cv2
import numpy as np
import joblib
import os
from PIL import Image # For image handling with Flask
import io

# Import functions from recognizer.py
from recognizer import align_face, get_embeddings, detector, predictor, facenet_model
# Make sure facenet_model is loaded correctly in recognizer.py and accessible

app = Flask(__name__)

# --- Load Trained Models ---
classifier = None
label_encoder = None

try:
    classifier = joblib.load('models/svm_classifier.pkl')
    label_encoder = joblib.load('models/label_encoder.pkl')
    print("Loaded classifier and label encoder for API.")
except FileNotFoundError:
    print("Error: Models not found. Please run recognizer.py first to train the models.")
    exit() # Exit if models are not found, as API won't work

@app.route('/')
def home():
    return "Face Recognition API is running! Send POST request to /recognize_face"

@app.route('/recognize_face', methods=['POST'])
def recognize_face_api():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        try:
            # Read image data
            in_memory_file = io.BytesIO()
            file.save(in_memory_file)
            data = np.fromstring(in_memory_file.getvalue(), dtype=np.uint8)
            img = cv2.imdecode(data, cv2.IMREAD_COLOR)

            if img is None:
                return jsonify({'error': 'Could not decode image'}), 400

            # Preprocess the image
            aligned_face = align_face(img, desired_face_width=160, desired_face_height=160)

            if aligned_face is None:
                return jsonify({'result': 'No face detected or aligned'}), 200

            # Add batch dimension for model prediction
            aligned_face_input = np.expand_dims(aligned_face, axis=0)

            # Get embedding
            embedding = get_embeddings(aligned_face_input, facenet_model)[0]

            # Predict identity
            predicted_label_idx = classifier.predict(embedding.reshape(1, -1))[0]
            probabilities = classifier.predict_proba(embedding.reshape(1, -1))[0]
            confidence = np.max(probabilities)

            predicted_name = label_encoder.inverse_transform([predicted_label_idx])[0]

            # Define a threshold for recognition
            recognition_threshold = 0.7

            display_name = predicted_name if confidence > recognition_threshold else "Unknown"

            return jsonify({
                'recognized_name': display_name,
                'confidence': float(f"{confidence*100:.2f}%"),
                'is_known': bool(confidence > recognition_threshold)
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    # For production, use a WSGI server like Gunicorn
    app.run(debug=True, host='0.0.0.0', port=5000)