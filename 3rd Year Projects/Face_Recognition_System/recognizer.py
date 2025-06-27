# recognizer.py

import cv2
import os
import numpy as np
import dlib
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import joblib # To save/load models
import time
import sys # To exit cleanly

# --- Configuration ---
# Set the desired input size for FaceNet model
FACENET_IMG_SIZE = (160, 160)
# Path to your dataset folder
DATASET_PATH = 'dataset'
# Path to save/load trained models
MODELS_PATH = 'models'
# Confidence threshold for recognizing a face (0.0 to 1.0)
# Tune this value: Higher means stricter recognition, lower means more lenient
RECOGNITION_THRESHOLD = 0.7

# --- Global Dlib Face Detector and Predictor ---
# You need to download 'shape_predictor_68_face_landmarks.dat'
# Search on Google: "shape_predictor_68_face_landmarks.dat download"
# Aur download karne ke baad, isko apne 'face_recognition_system' folder mein rakho
try:
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(os.path.join(os.path.dirname(__file__), "shape_predictor_68_face_landmarks.dat"))
    print("Dlib detector and predictor loaded successfully.")
except Exception as e:
    print(f"Error loading dlib components: {e}")
    print("Please ensure 'shape_predictor_68_face_landmarks.dat' is in the same directory as recognizer.py.")
    sys.exit("Exiting due to dlib error.")

# --- Load Pre-trained FaceNet Model ---
# This model takes a 160x160x3 image and outputs a 128-dimensional embedding
# Download 'facenet_keras_weights.h5' and place it in the 'models' folder.
# Search on Google: "facenet_keras_weights.h5 download github"
facenet_model = None
try:
    facenet_model_path = os.path.join(MODELS_PATH, 'facenet_keras_weights.h5')
    print(f"Attempting to load FaceNet model from: {os.path.abspath(facenet_model_path)}")
    facenet_model = tf.keras.models.load_model(facenet_model_path)
    print("FaceNet model loaded successfully.")
except Exception as e:
    print(f"Error loading FaceNet model: {e}")
    print(f"Please download 'facenet_keras_weights.h5' and place it in the '{MODELS_PATH}' folder.")
    sys.exit("Exiting due to FaceNet model loading error.")


# --- Preprocessing Functions ---

def align_face(image, desired_face_width=FACENET_IMG_SIZE[0], desired_face_height=FACENET_IMG_SIZE[1]):
    """
    Detects a face in the image, aligns it based on eye landmarks, and resizes it.

    Args:
        image (numpy.ndarray): The input image (BGR format).
        desired_face_width (int): Desired width of the output aligned face.
        desired_face_height (int): Desired height of the output aligned face.

    Returns:
        numpy.ndarray: The aligned and normalized face image (0-1 range), or None if no face detected.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Use upsampling (1) to help detect smaller or less clear faces
    rects = detector(gray, 1)

    if len(rects) == 0:
        return None # No face found

    # Take the largest face (assuming main subject is largest)
    # You might want to refine this for multiple faces
    rect = max(rects, key=lambda r: r.area())
    shape = predictor(gray, rect) # Get facial landmarks

    # Convert dlib shape to numpy array
    shape_np = np.zeros((68, 2), dtype="int")
    for i in range(0, 68):
        shape_np[i] = (shape.part(i).x, shape.part(i).y)

    # Calculate eye centers (average of eye landmarks)
    # Points 36-41 are for the left eye, 42-47 for the right eye
    left_eye_center = shape_np[36:42].mean(axis=0).astype("int")
    right_eye_center = shape_np[42:48].mean(axis=0).astype("int")

    # Calculate angle between eyes for rotation
    dY = right_eye_center[1] - left_eye_center[1]
    dX = right_eye_center[0] - left_eye_center[0]
    angle = np.degrees(np.arctan2(dY, dX))

    # Desired position of left eye in the output aligned image (e.g., 35% from left, 35% from top)
    desired_left_eye = (0.35, 0.35)

    # Calculate scale factor for resizing based on eye distance
    dist = np.sqrt((dX ** 2) + (dY ** 2)) # Distance between eyes
    desired_dist = (1 - desired_left_eye[0] * 2) * desired_face_width # Desired eye distance in output image
    scale = desired_dist / dist

    # Get center of eyes for rotation point
    eyes_center = ((left_eye_center[0] + right_eye_center[0]) // 2,
                   (left_eye_center[1] + right_eye_center[1]) // 2)

    # Get the rotation matrix
    M = cv2.getRotationMatrix2D(eyes_center, angle, scale)

    # Update the translation component of the matrix to align the eyes to the desired position
    tX = desired_face_width * 0.5
    tY = desired_face_height * desired_left_eye[1]
    M[0, 2] += (tX - eyes_center[0])
    M[1, 2] += (tY - eyes_center[1])

    # Apply the affine transformation
    aligned_face = cv2.warpAffine(image, M, (desired_face_width, desired_face_height), flags=cv2.INTER_CUBIC)

    # Normalize pixel values to 0-1 range (common for neural networks)
    aligned_face = aligned_face.astype('float32') / 255.0

    return aligned_face

def load_and_preprocess_dataset(dataset_path=DATASET_PATH, img_size=FACENET_IMG_SIZE):
    """
    Loads images from the dataset, preprocesses them (detects, aligns, normalizes faces),
    and collects their corresponding labels.

    Args:
        dataset_path (str): Path to the root dataset directory.
        img_size (tuple): Desired (width, height) of the preprocessed face images.

    Returns:
        tuple: A tuple containing:
            - numpy.ndarray: Array of preprocessed face images.
            - numpy.ndarray: Array of corresponding labels (person names).
    """
    embeddings = [] # We'll store preprocessed images here before getting embeddings
    labels = []

    # Get list of person names (subfolder names)
    person_names = sorted([d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))])

    print("\n--- Preprocessing dataset and preparing for embedding generation ---")
    if not person_names:
        print(f"No subfolders found in '{dataset_path}'. Please ensure you have run capture_faces.py.")
        return np.array([]), np.array([])

    for i, person_name in enumerate(person_names):
        person_dir = os.path.join(dataset_path, person_name)

        print(f"  Processing images for: {person_name} ({i+1}/{len(person_names)})")

        # Supported image extensions
        valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff')

        for img_name in os.listdir(person_dir):
            if img_name.lower().endswith(valid_extensions): # Case-insensitive check
                img_path = os.path.join(person_dir, img_name)
                img = cv2.imread(img_path)

                if img is None:
                    print(f"    Warning: Could not read image {img_path}. Skipping.")
                    continue

                aligned_face = align_face(img, desired_face_width=img_size[0], desired_face_height=img_size[1])

                if aligned_face is not None:
                    embeddings.append(aligned_face) # Store the aligned image
                    labels.append(person_name)
                else:
                    # Debugging hint for no face detection
                    # print(f"    No face detected or aligned in {img_name} for {person_name}. Check image quality.")
                    pass # Keep prints minimal during normal operation, uncomment for debug

    print(f"Total {len(embeddings)} faces preprocessed from the dataset.")
    return np.array(embeddings), np.array(labels)


# --- Embedding Generation and Classifier Training Functions ---

def get_embeddings(images_array, model):
    """
    Generates face embeddings for a batch of preprocessed images using the FaceNet model.

    Args:
        images_array (numpy.ndarray): Array of preprocessed face images (N, H, W, C).
        model (tf.keras.Model): The loaded FaceNet model.

    Returns:
        numpy.ndarray: Array of face embeddings (N, embedding_size).
    """
    if len(images_array) == 0:
        return np.array([])

    print(f"Generating embeddings for {len(images_array)} images...")
    embeddings = model.predict(images_array)
    print("Embeddings generation complete.")
    return embeddings

def train_classifier(embeddings, labels, model_save_path=os.path.join(MODELS_PATH, 'svm_classifier.pkl'),
                     encoder_save_path=os.path.join(MODELS_PATH, 'label_encoder.pkl')):
    """
    Trains an SVM classifier on face embeddings and corresponding labels, then saves the model.

    Args:
        embeddings (numpy.ndarray): Array of face embeddings.
        labels (numpy.ndarray): Array of corresponding labels (person names).
        model_save_path (str): Path to save the trained SVM classifier.
        encoder_save_path (str): Path to save the trained LabelEncoder.

    Returns:
        tuple: A tuple containing:
            - sklearn.svm.SVC: The trained SVM classifier.
            - sklearn.preprocessing.LabelEncoder: The trained LabelEncoder.
            Returns (None, None) if no embeddings are provided.
    """
    if len(embeddings) == 0:
        print("No embeddings provided for training the classifier. Skipping training.")
        return None, None

    print("\n--- Training SVM Classifier ---")
    print("Encoding labels...")
    le = LabelEncoder()
    encoded_labels = le.fit_transform(labels)

    print(f"Found {len(le.classes_)} unique individuals: {le.classes_}")

    print("Training SVM classifier (kernel='linear', probability=True)...")
    classifier = SVC(kernel='linear', probability=True)
    classifier.fit(embeddings, encoded_labels)

    print("Saving classifier and label encoder...")
    joblib.dump(classifier, model_save_path)
    joblib.dump(le, encoder_save_path)
    print(f"Training complete! Classifier saved to '{model_save_path}'")
    print(f"Label Encoder saved to '{encoder_save_path}'")
    return classifier, le

# --- Real-time Recognition Function ---

def recognize_faces_realtime(facenet_model, classifier, label_encoder):
    """
    Performs real-time face recognition using webcam feed.

    Args:
        facenet_model (tf.keras.Model): The loaded FaceNet model.
        classifier (sklearn.svm.SVC): The trained SVM classifier.
        label_encoder (sklearn.preprocessing.LabelEncoder): The trained LabelEncoder.
    """
    if classifier is None or label_encoder is None:
        print("Error: Classifier or LabelEncoder not loaded. Cannot perform real-time recognition.")
        return

    print("\n--- Starting Real-time Face Recognition (Press 'Q' to quit) ---")
    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        print("Error: Could not open webcam. Check if it's connected or in use.")
        return

    font = cv2.FONT_HERSHEY_SIMPLEX

    while True:
        ret, frame = cam.read()
        if not ret:
            print("Failed to grab frame.")
            break

        # Convert to grayscale for dlib detection (faster)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces. Use 0 for no upsampling, faster for real-time.
        # If faces are often missed, try 1.
        rects = detector(gray, 0)

        for rect in rects:
            # Get bounding box coordinates from dlib.rectangle object
            x1, y1, x2, y2 = rect.left(), rect.top(), rect.right(), rect.bottom()

            # --- Crop and align the face ---
            # Extract the face region from the original frame
            # Add a small margin to ensure the whole face is passed to align_face
            # This margin can be tuned
            margin_factor = 0.2
            face_img_margin_x1 = max(0, int(x1 - (x2 - x1) * margin_factor))
            face_img_margin_y1 = max(0, int(y1 - (y2 - y1) * margin_factor * 1.5)) # More margin on top for forehead
            face_img_margin_x2 = min(frame.shape[1], int(x2 + (x2 - x1) * margin_factor))
            face_img_margin_y2 = min(frame.shape[0], int(y2 + (y2 - y1) * margin_factor * 0.5)) # Less margin on bottom

            face_img_for_alignment = frame[face_img_margin_y1:face_img_margin_y2, face_img_margin_x1:face_img_margin_x2]

            aligned_face = align_face(face_img_for_alignment, desired_face_width=FACENET_IMG_SIZE[0],
                                      desired_face_height=FACENET_IMG_SIZE[1])

            predicted_name = "Unknown"
            confidence_str = "N/A"
            color = (0, 0, 255) # Default to Red (Unknown)

            if aligned_face is not None:
                # Add batch dimension (1, H, W, C) for model prediction
                aligned_face_input = np.expand_dims(aligned_face, axis=0)

                # Get embedding
                embedding = get_embeddings(aligned_face_input, facenet_model)[0]

                # Predict identity using the trained classifier
                # Reshape embedding for SVC prediction (1 sample, N features)
                predicted_label_idx = classifier.predict(embedding.reshape(1, -1))[0]

                # Get prediction probabilities for confidence
                probabilities = classifier.predict_proba(embedding.reshape(1, -1))[0]
                confidence = np.max(probabilities) # Max probability is confidence for predicted class

                # Convert numerical label back to name
                predicted_name_raw = label_encoder.inverse_transform([predicted_label_idx])[0]

                # Apply confidence threshold
                if confidence > RECOGNITION_THRESHOLD:
                    predicted_name = predicted_name_raw
                    color = (0, 255, 0) # Green (Known)
                else:
                    predicted_name = "Unknown" # Below threshold
                    color = (0, 165, 255) # Orange for uncertain known

                confidence_str = f"{confidence*100:.1f}%"
            else:
                # No face aligned means detection failed or face was too small/distorted
                predicted_name = "No Face Data"
                confidence_str = "N/A"
                color = (255, 0, 0) # Blue for no face data

            display_text = f"{predicted_name} ({confidence_str})"

            # Draw rectangle and text on the original frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, display_text, (x1, y1 - 10), font, 0.7, color, 2, cv2.LINE_AA)

        cv2.imshow("Face Recognition System", frame)

        k = cv2.waitKey(1) # Wait for 1 millisecond
        if k % 256 == 113: # Q key to quit
            print("Exiting real-time recognition.")
            break

    cam.release()
    cv2.destroyAllWindows()


# --- Main Execution Block ---

if __name__ == "__main__":
    # Ensure models directory exists
    os.makedirs(MODELS_PATH, exist_ok=True)

    # Paths for saved classifier and encoder
    classifier_path = os.path.join(MODELS_PATH, 'svm_classifier.pkl')
    encoder_path = os.path.join(MODELS_PATH, 'label_encoder.pkl')

    trained_classifier = None
    trained_label_encoder = None

    # Try to load existing models first
    try:
        if os.path.exists(classifier_path) and os.path.exists(encoder_path):
            print("\nAttempting to load existing classifier and label encoder...")
            trained_classifier = joblib.load(classifier_path)
            trained_label_encoder = joblib.load(encoder_path)
            print("Existing models loaded successfully.")
        else:
            print("\nNo existing models found. Will train new models.")
    except Exception as e:
        print(f"Error loading existing models: {e}. Will proceed to train new models.")
        trained_classifier = None
        trained_label_encoder = None

    # If models are not loaded or explicitly need retraining
    if trained_classifier is None or trained_label_encoder is None:
        print("\n--- Starting Model Training Process ---")

        # Step 1: Load and Preprocess Data from 'dataset' folder
        preprocessed_images, image_labels = load_and_preprocess_dataset(
            dataset_path=DATASET_PATH,
            img_size=FACENET_IMG_SIZE
        )

        if len(preprocessed_images) == 0:
            print("\nError: No valid faces found in the dataset for training.")
            print("Please ensure 'capture_faces.py' was run correctly and images are clear.")
            print("Exiting training phase. Cannot start real-time recognition without trained models.")
            sys.exit() # Exit if no data to train

        # Step 2: Generate Embeddings using the loaded FaceNet model
        all_embeddings = get_embeddings(preprocessed_images, facenet_model)

        # Step 3: Train Classifier
        trained_classifier, trained_label_encoder = train_classifier(
            all_embeddings,
            image_labels,
            model_save_path=classifier_path,
            encoder_save_path=encoder_path
        )

        if trained_classifier is None or trained_label_encoder is None:
            print("\nError: Classifier training failed. Cannot start real-time recognition.")
            sys.exit() # Exit if training failed
        else:
            print("\nModel training successful!")

    # Start Real-time Recognition
    recognize_faces_realtime(facenet_model, trained_classifier, trained_label_encoder)