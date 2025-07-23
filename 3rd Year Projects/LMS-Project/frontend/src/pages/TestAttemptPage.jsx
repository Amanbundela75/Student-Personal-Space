import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/TestServices.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// --- Helper component for status display ---
const StatusDisplay = ({ status, error }) => (
    <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Preparing Secure Test Environment</h2>
        <p>Status: {status}</p>
        {error && (
            <div style={{ color: 'red', marginTop: '15px', border: '1px solid red', padding: '10px', borderRadius: '5px' }}>
                <p><b>Error:</b> {error}</p>
                <p style={{ marginTop: '10px' }}>Please resolve the issue and refresh the page. Check camera permissions in your browser.</p>
            </div>
        )}
    </div>
);


const TestAttemptPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    // State Management
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Proctoring States
    const [proctoringStatus, setProctoringStatus] = useState('Not Started');

    // Refs
    const videoRef = useRef(null);
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);

    // --- STEP 1: Fetch Test Data ---
    useEffect(() => {
        const fetchTest = async () => {
            if (!token) {
                setError("Authentication error. Please log in again.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await testService.getTestById(testId, token);
                setTest(data);
                setAnswers(new Array(data.questions.length).fill(null));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load the test data.');
                console.error("Error fetching test:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, token]);

    // --- STEP 2: Setup Proctoring ONLY AFTER test data is loaded ---
    useEffect(() => {
        // Agar test data nahi hai, ya test proctored nahi hai, to kuch na karein.
        if (!test) {
            setProctoringStatus('Waiting for test data...');
            return;
        }
        if (!test.isProctored) {
            setProctoringStatus('Not Required');
            return;
        }

        const setupProctoring = async () => {
            try {
                setProctoringStatus('Initializing AI Engine...');
                await tf.ready();

                setProctoringStatus('Loading AI Model...');
                modelRef.current = await cocoSsd.load();

                setProctoringStatus('Accessing Webcam...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setProctoringStatus('Active');
                        // Yahan aap security listeners (fullscreen, etc.) start kar sakte hain
                    };
                }
            } catch (err) {
                // YEH SABSE ZAROORI HISSA HAI
                console.error("PROCTORING SETUP FAILED:", err); // Asli error ko console mein dekhein
                let errorMessage = "An unknown error occurred during setup.";
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage = "Webcam access was denied. Please allow camera permission in your browser's site settings and refresh.";
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMessage = "No webcam was found on your device. Please connect a camera and refresh.";
                } else if (err.message && err.message.includes('fetch')) {
                    errorMessage = "Failed to load the AI model. Please check your internet connection and that you can access tfhub.dev.";
                } else {
                    errorMessage = `A technical error occurred: ${err.name}. Please try again.`;
                }
                setError(errorMessage);
                setProctoringStatus('Failed');
            }
        };

        setupProctoring();

        // Cleanup function
        return () => {
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (document.fullscreenElement) document.exitFullscreen();
        };
    }, [test]); // YEH DEPENDENCY SABSE ZAROORI HAI!

    const handleOptionChange = (qIndex, oIndex) => { /* ... (Pehle jaisa hi) ... */ };
    const handleSubmit = async (e) => { /* ... (Pehle jaisa hi) ... */ };

    // --- RENDER LOGIC ---
    if (loading) {
        return <div className="container"><h2>Loading Test...</h2></div>;
    }

    if (error && proctoringStatus !== 'Failed') {
        return <div className="container error-message"><h2>Error</h2><p>{error}</p></div>;
    }

    if (test?.isProctored && proctoringStatus !== 'Active') {
        return <StatusDisplay status={proctoringStatus} error={error} />;
    }

    // Jab sab theek ho, test render karein
    return (
        <div className="test-attempt-container">
            {/* ... (Test questions form) ... */}
            <h2>{test?.title}</h2>
            {/* Form ka baaki ka code yahan aayega */}
        </div>
    );
};

export default TestAttemptPage;