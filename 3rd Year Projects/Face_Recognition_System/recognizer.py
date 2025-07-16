# recognizer.py - Part 1: Imports, Face Detection and Alignment Functions
import cv2
import os
import numpy as np
import dlib
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import joblib # To save/load models

# --- Dlib Face Detector and Predictor ---
# You need to download 'shape_predictor_68_face_landmarks.dat'
# Search on Google: "shape_predictor_68_face_landmarks.dat download"
# Aur download karne ke baad, isko apne 'face_recognition_system' folder mein rakho
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

def align_face(image, desired_face_width=160, desired_face_height=160):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 1) # Detect faces in the grayscale image

    if len(rects) == 0:
        return None # No face found

    # For simplicity, we'll take the first detected face
    # In a real system, you might want to choose the largest face or handle multiple faces
    rect = rects[0]
    shape = predictor(gray, rect) # Get facial landmarks

    # Convert dlib shape to numpy array
    shape_np = np.zeros((68, 2), dtype="int")
    for i in range(0, 68):
        shape_np[i] = (shape.part(i).x, shape.part(i).y)

    # Calculate eye centers (average of eye landmarks)
    left_eye_center = shape_np[36:42].mean(axis=0).astype("int")
    right_eye_center = shape_np[42:48].mean(axis=0).astype("int")

    # Calculate angle between eyes for rotation
    dY = right_eye_center[1] - left_eye_center[1]
    dX = right_eye_center[0] - left_eye_center[0]
    angle = np.degrees(np.arctan2(dY, dX))

    # To ensure eyes are horizontally aligned after rotation
    # Adjusting angle by -180 makes the angle calculation consistent for standard alignment
    angle = np.degrees(np.arctan2(dY, dX)) # This angle is for the line connecting eyes

    # Define desired position of left eye in the output aligned image (e.g., 35% from left, 35% from top)
    desired_left_eye = (0.35, 0.35)

    # Calculate scale for resizing
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

# --- Function to load and preprocess images from dataset ---
def load_and_preprocess_dataset(dataset_path='dataset', img_size=(160, 160)):
    embeddings = []
    labels = []
    person_names = sorted(os.listdir(dataset_path)) # Get list of person names

    print("\nPreprocessing and generating embeddings for dataset...")
    for i, person_name in enumerate(person_names):
        person_dir = os.path.join(dataset_path, person_name)
        if not os.path.isdir(person_dir):
            continue

        print(f"  Processing images for: {person_name} ({i+1}/{len(person_names)})")
        for img_name in os.listdir(person_dir):
            if img_name.endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(person_dir, img_name)
                img = cv2.imread(img_path)

                if img is None:
                    print(f"    Warning: Could not read image {img_path}")
                    continue

                aligned_face = align_face(img, desired_face_width=img_size[0], desired_face_height=img_size[1])

                if aligned_face is not None:
                    # FaceNet expects input in a specific format (e.g., 160x160x3)
                    # We already resized during alignment, just ensure correct shape
                    if aligned_face.shape != (*img_size, 3):
                        aligned_face = cv2.resize(aligned_face, img_size) # Double check resize if needed
                        aligned_face = aligned_face.astype('float32') # Ensure float type after resize if not already

                    embeddings.append(aligned_face)
                    labels.append(person_name)
                else:
                    print(f"    No face detected or aligned in {img_name} for {person_name}")

    return np.array(embeddings), np.array(labels)

# recognizer.py - Part 2: FaceNet Model and Embedding Generation

# --- Load Pre-trained FaceNet Model ---
# This model takes a 160x160x3 image and outputs a 128-dimensional embedding
# Make sure you have an internet connection when you run this for the first time
try:
    facenet_model = tf.keras.models.load_model('models/facenet_keras_weights.h5')
    print("Loaded FaceNet model from file.")
except Exception:
    print("Loading FaceNet model from TensorFlow Hub (first time download will take time)...")
    # You might need to use a specific version like 'google/imagenet/inception_v1_feature_vector/1'
    # Or find a FaceNet specific model on TF Hub
    # For simplicity, let's use a known FaceNet Keras implementation if you have it,
    # or a generic feature extractor and adapt.
    # A common approach is to use a pre-trained InceptionResNetV1 which is the base of FaceNet
    # We will download weights from a known source or use a simplified version for practical purposes.
    # Let's assume we're using a common FaceNet Keras implementation.
    # For a direct download: search for 'facenet_keras_weights.h5' and place it in the 'models' folder.
    # Alternatively, you can use:
    # from tensorflow.keras.applications import InceptionResNetV2
    # base_model = InceptionResNetV2(weights='imagenet', include_top=False, input_shape=(160, 160, 3))
    # x = base_model.output
    # x = tf.keras.layers.GlobalAveragePooling2D()(x)
    # x = tf.keras.layers.Dense(128)(x) # Output 128-dim embedding
    # x = tf.keras.layers.Lambda(lambda x: tf.math.l2_normalize(x, axis=-1))(x)
    # facenet_model = tf.keras.Model(inputs=base_model.input, outputs=x)

    # For this practical guide, download 'facenet_keras_weights.h5' and put it in the 'models' folder.
    # Search for "facenet_keras_weights.h5 download github"
    print("Please download 'facenet_keras_weights.h5' manually and place it in the 'models' folder.")
    print("You can find it on GitHub repositories related to FaceNet Keras implementations.")
    exit("FaceNet model not found. Exiting.")


def get_embeddings(images_array, model):
    if len(images_array) == 0:
        return np.array([])
    # Model expects batch dimension (N, H, W, C)
    embeddings = model.predict(images_array)
    return embeddings

# --- Training the Classifier ---
def train_classifier(embeddings, labels, model_path='models/svm_classifier.pkl', encoder_path='models/label_encoder.pkl'):
    if len(embeddings) == 0:
        print("No embeddings to train the classifier. Make sure your dataset has images with detected faces.")
        return None, None

    print("\nEncoding labels...")
    le = LabelEncoder()
    encoded_labels = le.fit_transform(labels)

    print("Training SVM classifier...")
    # Using 'linear' kernel is often good for embeddings. probability=True for score.
    classifier = SVC(kernel='linear', probability=True)
    classifier.fit(embeddings, encoded_labels)

    print("Saving classifier and label encoder...")
    joblib.dump(classifier, model_path)
    joblib.dump(le, encoder_path)
    print("Training complete! Classifier and encoder saved.")
    return classifier, le

# --- Main function to run training ---
if __name__ == "__main__":
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)

    # Step 1: Load and Preprocess Data
    # img_size is (width, height), FaceNet expects 160x160
    preprocessed_images, image_labels = load_and_preprocess_dataset(dataset_path='dataset', img_size=(160, 160))

    if len(preprocessed_images) == 0:
        print("No preprocessed images found. Please ensure 'capture_faces.py' was run and faces were detected.")
    else:
        # Step 2: Generate Embeddings
        print(f"\nGenerating embeddings for {len(preprocessed_images)} images...")
        all_embeddings = get_embeddings(preprocessed_images, facenet_model)
        print(f"Generated {len(all_embeddings)} embeddings, each with shape {all_embeddings.shape[1]}.")

        # Step 3: Train Classifier
        trained_classifier, trained_label_encoder = train_classifier(all_embeddings, image_labels)

        if trained_classifier and trained_label_encoder:
            print("\nClassifier and Label Encoder are ready for use!")

            # Quick test (optional, for validation)
            # You would normally do a train-test split for robust evaluation
            # For simplicity, let's just show how to use it
            print("\nPerforming a quick test with one of the training images...")
            if len(all_embeddings) > 0:
                sample_embedding = all_embeddings[0].reshape(1, -1)
                sample_label = image_labels[0]

                predicted_label_idx = trained_classifier.predict(sample_embedding)[0]
                predicted_name = trained_label_encoder.inverse_transform([predicted_label_idx])[0]

                print(f"Original: {sample_label}, Predicted: {predicted_name}")
                if sample_label == predicted_name:
                    print("Test successful for this sample!")
                else:
                    print("Test failed for this sample. Check your data or model.")