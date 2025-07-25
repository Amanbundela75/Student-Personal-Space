import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/TestServices.js';

// --- Helper component for status display ---
const StatusDisplay = ({ status, error }) => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Preparing Secure Test Environment</h2>
        <p>Status: {status}</p>
        {error && <p style={{ color: 'red' }}><b>Error:</b> {error}</p>}
    </div>
);

const TestAttemptPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    // States
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [proctoringStatus, setProctoringStatus] = useState('Not Started');
    const [isTestActive, setIsTestActive] = useState(false); // Naya state test shuru karne ke liye
    const [submitting, setSubmitting] = useState(false);
    const [warnings, setWarnings] = useState({ tab: 0, copy: 0 });

    const MAX_WARNINGS = 2;

    // Refs
    const videoRef = useRef(null);
    const testContainerRef = useRef(null);
    const submitFunctionRef = useRef();

    // Fetch Test Data
    useEffect(() => {
        const fetchTest = async () => {
            try {
                setLoading(true);
                const data = await testService.getTestById(testId);
                setTest(data);
                setAnswers(new Array(data.questions.length).fill(null));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load test data.');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    // Test Submit Function
    const handleTestSubmit = useCallback(async (reason) => {
        if (submitting) return;
        setSubmitting(true);
        alert(`Test submitted automatically: ${reason}`);
        try {
            await testService.submitTest({ testId, answers });
            if (document.fullscreenElement) document.exitFullscreen();
            navigate('/my-results');
        } catch (err) {
            setError('Failed to submit the test.');
            setSubmitting(false);
        }
    }, [answers, testId, navigate, submitting]);

    useEffect(() => {
        submitFunctionRef.current = handleTestSubmit;
    });

    // Proctoring Setup
    useEffect(() => {
        if (!test || !test.isProctored) {
            if (test) setProctoringStatus('Not Required');
            return;
        }
        let stream;
        const setup = async () => {
            try {
                setProctoringStatus('Initializing...');
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                setProctoringStatus('Ready'); // Test shuru karne ke liye taiyar
            } catch (err) {
                setError(err.message || "Webcam access failed.");
                setProctoringStatus('Failed');
            }
        };
        setup();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [test]);

    // Anti-Cheating Listeners
    useEffect(() => {
        if (!isTestActive) return; // Listeners tabhi lagayein jab test active ho

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const newWarnings = { ...warnings, tab: warnings.tab + 1 };
                setWarnings(newWarnings);
                if (newWarnings.tab >= MAX_WARNINGS) {
                    submitFunctionRef.current("Tab switching limit exceeded.");
                } else {
                    alert(`Warning: Tab switching is not allowed.`);
                }
            }
        };

        const handleCopyPaste = (e) => {
            e.preventDefault();
            const newWarnings = { ...warnings, copy: warnings.copy + 1 };
            setWarnings(newWarnings);
            if (newWarnings.copy >= MAX_WARNINGS) {
                submitFunctionRef.current("Copy-paste attempts exceeded.");
            } else {
                alert(`Warning: Copying content is not allowed.`);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        const testNode = testContainerRef.current;
        if (testNode) {
            testNode.addEventListener('copy', handleCopyPaste);
            testNode.addEventListener('contextmenu', handleCopyPaste);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (testNode) {
                testNode.removeEventListener('copy', handleCopyPaste);
                testNode.removeEventListener('contextmenu', handleCopyPaste);
            }
            if (document.fullscreenElement) document.exitFullscreen();
        };
    }, [isTestActive, warnings]);

    // --- NAYA FUNCTION: FULLSCREEN SHURU KARNE KE LIYE ---
    const startTestAndFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsTestActive(true); // Ab test dikhayein
        } catch (err) {
            alert("Could not enter fullscreen. Please enable it to start the test.");
            console.error("Fullscreen error:", err);
        }
    };

    // --- RENDER LOGIC ---
    if (loading) return <div className="container"><h2>Loading...</h2></div>;
    if (!test) return <div className="container error-message"><h2>Error</h2><p>{error || "Could not load test."}</p></div>;

    return (
        <div className="test-attempt-container" ref={testContainerRef}>

            {/* --- YEH RAHA AAPKA CHOTA WEBCAM VIDEO --- */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width="200"  // Choti chaudai
                height="150" // Choti unchai
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    display: isTestActive ? 'block' : 'none', // Sirf test ke dauran dikhega
                    border: '3px solid #007bff', // Ek neela border
                    borderRadius: '8px' // Thode gol kone
                }}
            />

            {isTestActive ? (
                <div>
                    <h2>{test.title}</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleTestSubmit("Manual submission"); }}>
                        {test.questions.map((q, qIndex) => (
                            <div key={q._id || qIndex} style={{ margin: '20px 0', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <h4>{`Q${qIndex + 1}: ${q.questionText}`}</h4>
                                {q.options.map((option, oIndex) => (
                                    <label key={oIndex} style={{ display: 'block', margin: '8px 0', padding: '10px', cursor: 'pointer' }}>
                                        <input type="radio" name={`question-${qIndex}`} checked={answers[qIndex] === oIndex} onChange={() => { /* ... */ }} />
                                        {` ${option}`}
                                    </label>
                                ))}
                            </div>
                        ))}
                        <button type="submit" disabled={submitting}>Submit Test</button>
                    </form>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    {proctoringStatus === 'Failed' && <StatusDisplay status="Failed" error={error} />}
                    {proctoringStatus === 'Ready' && (
                        <div>
                            <h2>Test is Ready</h2>
                            <p>Click the button below to start the test in fullscreen mode.</p>
                            <button onClick={startTestAndFullscreen} style={{padding: '15px 30px', fontSize: '18px'}}>
                                Start Test
                            </button>
                        </div>
                    )}
                    {proctoringStatus !== 'Ready' && proctoringStatus !== 'Failed' && <StatusDisplay status={proctoringStatus} />}
                </div>
            )}
        </div>
    );
};

export default TestAttemptPage;