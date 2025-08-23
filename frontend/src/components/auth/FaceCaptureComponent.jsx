import React, { useRef, useState, useEffect } from 'react';

const FaceCaptureComponent = ({ onCapture }) => { // onCapture ek prop hai jisse captured image parent ko bhejenge
    const videoRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [streamActive, setStreamActive] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let stream = null; // stream ko store karne ke liye variable

        async function getCameraStream() {
            if (streamActive) return; // Agar stream pehle se active hai toh dobara start na karein

            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreamActive(true);
                    setError(''); // Purana error clear karein
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                if (err.name === "NotAllowedError") {
                    setError("Camera access was denied. Please allow camera access in your browser settings and refresh.");
                } else if (err.name === "NotFoundError") {
                    setError("No camera found. Please ensure a camera is connected.");
                } else {
                    setError("Could not access the camera. Please ensure it's not in use by another application.");
                }
                setStreamActive(false);
            }
        }

        getCameraStream();

        // Cleanup function to stop the stream when component unmounts or streamActive changes
        return () => {
            if (stream) { // stream variable ka istemal karein
                stream.getTracks().forEach(track => track.stop());
                console.log("Camera stream stopped.");
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null; // Release the srcObject
            }
            setStreamActive(false);
        };
    }, []); // Empty dependency array: runs once on mount, cleans up on unmount

    const handleCapture = () => {
        if (!videoRef.current || !videoRef.current.srcObject || !streamActive) {
            setError("Camera stream is not active or available to capture.");
            return;
        }
        setError('');
        const canvas = document.createElement('canvas');
        // Set canvas dimensions to match the video to avoid distortion
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to image data (e.g., base64 JPEG)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 for quality
        setCapturedImage(imageDataUrl);

        // Pass the captured image data to the parent component
        if (onCapture) {
            onCapture(imageDataUrl);
        }
    };

    return (
        <div className="face-capture-container" style={{ textAlign: 'center', margin: '20px 0' }}>
            <h4>Face Capture</h4>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <div style={{ border: '1px solid #ccc', width: '324px', height: '244px', margin: '0 auto', marginBottom: '10px', position: 'relative', backgroundColor: '#000' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '320px', height: '240px', display: streamActive ? 'block' : 'none', objectFit: 'cover' }}
                />
                {!streamActive && !error && <p style={{color: '#fff', textAlign: 'center', paddingTop: '100px'}}>Starting camera...</p>}
                {!streamActive && error && <p style={{color: '#fff', textAlign: 'center', paddingTop: '80px', padding: '10px'}}>Camera not available. Check permissions or if another app is using it.</p>}
            </div>

            <button type="button" onClick={handleCapture} disabled={!streamActive} className="button button-primary">
                Capture Face
            </button>

            {capturedImage && (
                <div style={{ marginTop: '20px' }}>
                    <h5>Captured Image Preview:</h5>
                    <img src={capturedImage} alt="Captured face" style={{ maxWidth: '160px', maxHeight: '120px', border: '1px solid #ddd' }} />
                </div>
            )}
        </div>
    );
};

export default FaceCaptureComponent;