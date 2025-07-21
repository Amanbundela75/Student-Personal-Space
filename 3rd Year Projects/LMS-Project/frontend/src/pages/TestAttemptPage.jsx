import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/TestServices.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

// AI और वेबकैम के लिए ज़रूरी इम्पोर्ट्स
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const TestAttemptPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // --- प्रॉक्टरिंग और सुरक्षा के लिए स्टेट्स ---
    const [proctoringStatus, setProctoringStatus] = useState('Initializing...');
    const [fullscreenWarning, setFullscreenWarning] = useState(false);
    const videoRef = useRef(null);
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const absenceCounterRef = useRef(0); // अब यह इस्तेमाल होगा
    const warningTimeoutRef = useRef(null);

    // --- टेस्ट को जबरदस्ती सबमिट करने के लिए फंक्शन ---
    const forceSubmitTest = async (reason) => {
        if (submitting) return;

        console.warn(`Force submitting test due to: ${reason}`);
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setError(`Test automatically submitted. Reason: ${reason}`);
        setSubmitting(true);
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

        try {
            const submissionData = { testId, answers };
            await testService.submitTest(submissionData, token);
            setTimeout(() => {
                navigate('/my-results', { state: { message: `Test submitted automatically due to: ${reason}` } });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit the test.');
            console.error(err);
            setSubmitting(false);
        }
    };

    // --- AI प्रॉक्टरिंग और सुरक्षा उपायों का सेटअप ---
    useEffect(() => {
        const setupProctoringAndSecurity = async () => {
            try {
                await tf.ready();
                setProctoringStatus('Loading AI Model...');
                modelRef.current = await cocoSsd.load();
                setProctoringStatus('Accessing Webcam...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setProctoringStatus('Proctoring Active');
                        startProctoringAndSecurity();
                    };
                }
            } catch (err) {
                console.error("Proctoring setup failed:", err);
                setError("Could not start proctoring. Please allow webcam access and refresh.");
                setProctoringStatus('Setup Failed');
            }
        };

        const startProctoringAndSecurity = () => {
            document.documentElement.requestFullscreen().catch(err => {
                console.error("Failed to enter fullscreen:", err);
                setError("Please enable fullscreen mode to start the test.");
            });

            detectionIntervalRef.current = setInterval(detectFrame, 2000);

            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('contextmenu', preventDefault);
            window.addEventListener('copy', preventDefault);
            window.addEventListener('paste', preventDefault);
            window.addEventListener('keydown', handleKeydown);
        };

        // --- फ्रेम डिटेक्ट करने का फंक्शन (सही किया हुआ) ---
        const detectFrame = async () => {
            if (!modelRef.current || !videoRef.current || videoRef.current.readyState < 3) {
                return;
            }

            const predictions = await modelRef.current.detect(videoRef.current);
            let personFound = false;
            let phoneFound = false;

            for (let i = 0; i < predictions.length; i++) {
                if (predictions[i].class === 'person' && predictions[i].score > 0.6) {
                    personFound = true;
                }
                if (predictions[i].class === 'cell phone' && predictions[i].score > 0.5) {
                    phoneFound = true;
                }
            }

            if (phoneFound) {
                forceSubmitTest("Mobile phone detected.");
            }

            if (!personFound) {
                absenceCounterRef.current += 1;
                if (absenceCounterRef.current > 5) { // 10 सेकंड के बाद
                    forceSubmitTest("Student not present in front of camera.");
                }
            } else {
                absenceCounterRef.current = 0;
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFullscreenWarning(true);
                warningTimeoutRef.current = setTimeout(() => {
                    forceSubmitTest("Exited fullscreen mode and did not return.");
                }, 5000);
            } else {
                setFullscreenWarning(false);
                if (warningTimeoutRef.current) {
                    clearTimeout(warningTimeoutRef.current);
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                forceSubmitTest("Tab switched or window minimized.");
            }
        };

        const preventDefault = (e) => {
            e.preventDefault();
            alert("This action is disabled during the test.");
        };

        const handleKeydown = (e) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && (e.key === 'c' || e.key === 'v'))) {
                e.preventDefault();
                alert("This action is disabled during the test.");
            }
        };

        setupProctoringAndSecurity();

        return () => {
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('contextmenu', preventDefault);
            window.removeEventListener('copy', preventDefault);
            window.removeEventListener('paste', preventDefault);
            window.removeEventListener('keydown', handleKeydown);
            if (document.fullscreenElement) document.exitFullscreen();
        };
    }, []);

    useEffect(() => {
        if (!token) {
            setError("Please log in to attempt the test.");
            setLoading(false);
            return;
        }
        const fetchTest = async () => {
            try {
                setLoading(true);
                const data = await testService.getTestById(testId, token);
                setTest(data);
                setAnswers(new Array(data.questions.length).fill(null));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load the test.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, token]);

    const handleOptionChange = (questionIndex, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const unansweredQuestions = answers.filter(ans => ans === null).length;
        if (unansweredQuestions > 0) {
            if (!window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`)) {
                return;
            }
        }
        setSubmitting(true);
        try {
            const submissionData = { testId, answers };
            await testService.submitTest(submissionData, token);
            navigate('/my-results', { state: { message: 'Test submitted successfully!' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit the test.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container">Loading Test...</div>;

    if (proctoringStatus !== 'Proctoring Active' && !error) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Preparing Secure Test Environment</h2>
                <p>{proctoringStatus}</p>
                {proctoringStatus === 'Setup Failed' && <p style={{color: 'red'}}>Please check camera permissions and refresh.</p>}
            </div>
        );
    }

    if (error) return <div className="container" style={{ color: 'red', textAlign: 'center', padding: '50px' }}><h2>Error</h2><p>{error}</p></div>;

    return (
        <div className="test-attempt-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto', userSelect: 'none' }}>
            {fullscreenWarning && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h2 style={{color: 'red'}}>Warning: Fullscreen Required</h2>
                    <p>You have exited fullscreen mode. Please re-enter fullscreen immediately.</p>
                    <p>The test will be submitted automatically in 5 seconds.</p>
                    <button onClick={() => document.documentElement.requestFullscreen()} className="button button-primary">Re-enter Fullscreen</button>
                </div>
            )}

            <div style={{ position: 'fixed', top: '20px', right: '20px', border: '2px solid #ccc', padding: '10px', backgroundColor: 'white', zIndex: 1000 }}>
                <video ref={videoRef} autoPlay playsInline muted width="240" height="180" style={{ display: 'block' }} />
                <p style={{ textAlign: 'center', margin: '5px 0 0', fontWeight: 'bold' }}>
                    Status: <span style={{ color: proctoringStatus === 'Proctoring Active' ? 'green' : 'orange' }}>{proctoringStatus}</span>
                </p>
            </div>

            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{test?.title}</h2>
            <form onSubmit={handleSubmit}>
                {test?.questions.map((q, qIndex) => (
                    <div key={q._id || qIndex} style={{ marginBottom: '25px', border: '1px solid #f0f0f0', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>{`Q${qIndex + 1}: ${q.questionText}`}</h4>
                        {q.options.map((option, oIndex) => (
                            <label key={oIndex} htmlFor={`q${qIndex}-o${oIndex}`} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer' }}>
                                <input type="radio" id={`q${qIndex}-o${oIndex}`} name={`question-${qIndex}`} value={oIndex} checked={answers[qIndex] === oIndex} onChange={() => handleOptionChange(qIndex, oIndex)} style={{ marginRight: '12px', marginTop: '4px', flexShrink: 0 }} />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                ))}
                <button type="submit" disabled={submitting} className="button button-primary" style={{ padding: '12px 25px', fontSize: '16px', cursor: 'pointer', width: '100%' }}>
                    {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
            </form>
        </div>
    );
};

export default TestAttemptPage;