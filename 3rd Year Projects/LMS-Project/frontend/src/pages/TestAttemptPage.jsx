import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/TestServices.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

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
    const [fullscreenWarning, setFullscreenWarning] = useState(false);

    // Refs for managing resources
    const videoRef = useRef(null);
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const warningTimeoutRef = useRef(null);

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
                setError(err.response?.data?.message || 'Failed to load the test.');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, token]);

    // --- STEP 2: Setup Proctoring ONLY AFTER test data is loaded ---
    useEffect(() => {
        // Agar test data nahi hai, ya test proctored nahi hai, to kuch na karein.
        if (!test || !test.isProctored) {
            setProctoringStatus(test ? 'Not Required' : 'Waiting for test data...');
            return;
        }

        const setupProctoring = async () => {
            try {
                setProctoringStatus('Initializing AI Engine...');
                await tf.ready();

                setProctoringStatus('Loading AI Model (this may take a moment)...');
                modelRef.current = await cocoSsd.load();

                setProctoringStatus('Accessing Webcam...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setProctoringStatus('Active');
                        startSecurityListeners(); // Ab sab kuch taiyar hai
                    };
                }
            } catch (err) {
                console.error("Proctoring setup failed:", err);
                let errorMessage = "Could not start proctoring. Please check permissions and refresh.";
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage = "Webcam access denied. Please allow camera permission and refresh.";
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMessage = "No webcam found. Please connect a camera and refresh.";
                } else if (err.message.includes('Could not fetch')) {
                    errorMessage = "Failed to load AI model. Please check your network connection.";
                }
                setError(errorMessage);
                setProctoringStatus('Failed');
            }
        };

        setupProctoring();

        // Cleanup function
        return () => {
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (document.fullscreenElement) document.exitFullscreen();
        };
    }, [test]); // Yeh useEffect tabhi chalega jab 'test' state update hoga.

    const startSecurityListeners = () => {
        // Implement security listeners (fullscreen, visibility etc.) here
        // This is just an example
        document.documentElement.requestFullscreen().catch(err => console.error("Fullscreen request failed:", err));
    };

    const handleOptionChange = (questionIndex, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await testService.submitTest({ testId, answers }, token);
            navigate('/my-results', { state: { message: 'Test submitted successfully!' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit the test.');
            setSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="container status-page"><h2>Loading Test...</h2></div>;
    }

    // Yadi test proctored hai, toh setup complete hone tak wait karein
    if (test?.isProctored && proctoringStatus !== 'Active') {
        return (
            <div className="container status-page">
                <h2>Preparing Secure Test Environment</h2>
                <p>Status: {proctoringStatus}</p>
                {proctoringStatus === 'Failed' && (
                    <div className="error-box">
                        <p><b>Error:</b> {error}</p>
                        <p>Please resolve the issue and refresh the page.</p>
                    </div>
                )}
            </div>
        );
    }

    // Agar koi aam error hai (test load nahi hua, etc.)
    if (error && !submitting) {
        return <div className="container status-page error-box"><h2>An Error Occurred</h2><p>{error}</p></div>;
    }

    // Jab sab theek ho, test render karein
    return (
        <div className="test-attempt-container">
            {test?.isProctored && (
                <div className="proctoring-widget">
                    <video ref={videoRef} autoPlay playsInline muted width="200" height="150" />
                    <p>Status: <span className={proctoringStatus === 'Active' ? 'status-active' : 'status-inactive'}>{proctoringStatus}</span></p>
                </div>
            )}

            <h2 className="test-title">{test?.title}</h2>
            <form onSubmit={handleSubmit}>
                {test?.questions.map((q, qIndex) => (
                    <div key={q._id || qIndex} className="question-card">
                        <h4>{`Q${qIndex + 1}: ${q.questionText}`}</h4>
                        <div className="options-list">
                            {q.options.map((option, oIndex) => (
                                <label key={oIndex} className="option-label">
                                    <input type="radio" name={`question-${qIndex}`} value={oIndex} checked={answers[qIndex] === oIndex} onChange={() => handleOptionChange(qIndex, oIndex)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button type="submit" disabled={submitting} className="button button-primary submit-btn">
                    {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
            </form>
        </div>
    );
};

export default TestAttemptPage;