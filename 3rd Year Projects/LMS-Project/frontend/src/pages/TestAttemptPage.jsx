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

    // --- प्रॉक्टरिंग के लिए नए स्टेट्स ---
    const [proctoringStatus, setProctoringStatus] = useState('Initializing...');
    const videoRef = useRef(null);
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const absenceCounterRef = useRef(0); // छात्र की अनुपस्थिति को गिनने के लिए

    // --- टेस्ट को जबरदस्ती सबमिट करने के लिए फंक्शन ---
    const forceSubmitTest = async (reason) => {
        if (submitting) return; // अगर पहले से सबमिट हो रहा है तो कुछ न करें

        console.warn(`Force submitting test due to: ${reason}`);
        setError(`Test automatically submitted. Reason: ${reason}`);
        setSubmitting(true);
        // डिटेक्शन रोकें
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }

        try {
            const submissionData = { testId, answers };
            await testService.submitTest(submissionData, token);
            // 3 सेकंड के बाद रिजल्ट पेज पर भेजें ताकि छात्र मैसेज पढ़ सके
            setTimeout(() => {
                navigate('/my-results', { state: { message: `Test submitted automatically due to: ${reason}` } });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit the test.');
            console.error(err);
            setSubmitting(false); // अगर एरर आए तो सबमिटिंग स्टेट को रीसेट करें
        }
    };


    // --- AI प्रॉक्टरिंग का लॉजिक ---
    useEffect(() => {
        const setupProctoring = async () => {
            try {
                // 1. TensorFlow.js बैकएंड सेट करें
                await tf.ready();
                setProctoringStatus('Loading AI Model...');

                // 2. AI मॉडल लोड करें
                modelRef.current = await cocoSsd.load();
                setProctoringStatus('Accessing Webcam...');

                // 3. वेबकैम एक्सेस करें
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setProctoringStatus('Proctoring Active');
                        // डिटेक्शन शुरू करें
                        detectionIntervalRef.current = setInterval(detectFrame, 2000); // हर 2 सेकंड में डिटेक्ट करें
                    };
                }
            } catch (err) {
                console.error("Proctoring setup failed:", err);
                setError("Could not start proctoring. Please allow webcam access and refresh.");
                setProctoringStatus('Setup Failed');
            }
        };

        // --- फ्रेम डिटेक्ट करने का फंक्शन ---
        const detectFrame = async () => {
            if (!modelRef.current || !videoRef.current || videoRef.current.readyState < 3) {
                return;
            }

            const predictions = await modelRef.current.detect(videoRef.current);
            let personFound = false;
            let phoneFound = false;

            // भविष्यवाणियों (predictions) को जांचें
            for (let i = 0; i < predictions.length; i++) {
                if (predictions[i].class === 'person' && predictions[i].score > 0.6) {
                    personFound = true;
                }
                if (predictions[i].class === 'cell phone' && predictions[i].score > 0.5) {
                    phoneFound = true;
                }
            }

            // अगर मोबाइल फोन मिलता है, तो टेस्ट तुरंत सबमिट करें
            if (phoneFound) {
                forceSubmitTest("Mobile phone detected.");
            }

            // अगर व्यक्ति नहीं मिलता है, तो काउंटर बढ़ाएं
            if (!personFound) {
                absenceCounterRef.current += 1;
                // अगर 5 बार (10 सेकंड) तक व्यक्ति नहीं मिलता है, तो टेस्ट सबमिट करें
                if (absenceCounterRef.current > 5) {
                    forceSubmitTest("Student not present in front of camera.");
                }
            } else {
                // अगर व्यक्ति मिल जाता है, तो काउंटर रीसेट करें
                absenceCounterRef.current = 0;
            }
        };

        setupProctoring();

        // कंपोनेंट अनमाउंट होने पर क्लीनअप करें
        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // यह इफेक्ट सिर्फ एक बार चलेगा

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
    // प्रॉक्टरिंग सेटअप होने तक टेस्ट न दिखाएं
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
        <div className="test-attempt-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            {/* --- वेबकैम और प्रॉक्टरिंग स्टेटस --- */}
            <div style={{ position: 'fixed', top: '80px', right: '20px', border: '2px solid #ccc', padding: '10px', backgroundColor: 'white', zIndex: 1000 }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    width="240"
                    height="180"
                    style={{ display: 'block' }}
                />
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
                                <input
                                    type="radio"
                                    id={`q${qIndex}-o${oIndex}`}
                                    name={`question-${qIndex}`}
                                    value={oIndex}
                                    checked={answers[qIndex] === oIndex}
                                    onChange={() => handleOptionChange(qIndex, oIndex)}
                                    style={{ marginRight: '12px', marginTop: '4px', flexShrink: 0 }}
                                />
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