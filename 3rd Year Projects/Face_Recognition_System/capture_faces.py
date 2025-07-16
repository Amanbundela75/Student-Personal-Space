# capture_faces.py
import cv2
import os
import time

def capture_images():
    name = input("Enter the name of the person (e.g., 'Ankit', 'Priya'): ")

    # Dataset folder ke andar person ke naam ka folder
    dataset_path = os.path.join('dataset', name)
    os.makedirs(dataset_path, exist_ok=True) # Agar folder pehle se hai toh error nahi dega

    cam = cv2.VideoCapture(0) # 0 for default webcam
    if not cam.isOpened():
        print("Error: Could not open webcam.")
        return

    img_counter = 0
    print(f"\nCapturing images for {name}. Press 'SPACE' to capture, 'Q' to quit.")

    while True:
        ret, frame = cam.read()
        if not ret:
            print("Failed to grab frame.")
            break

        cv2.imshow("Capture Faces - Press SPACE to capture, Q to quit", frame)

        k = cv2.waitKey(1) # Wait for 1 millisecond

        if k % 256 == 32:  # SPACE key
            img_name = os.path.join(dataset_path, f"{img_counter:03d}.jpg")
            cv2.imwrite(img_name, frame)
            print(f"{img_name} captured!")
            img_counter += 1
            time.sleep(0.1) # Small delay to avoid capturing too fast
        elif k % 256 == 113: # Q key
            print("Exiting capture.")
            break

    cam.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    capture_images()