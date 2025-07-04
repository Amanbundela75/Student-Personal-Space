import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/TestServices.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

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
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div className="test-attempt-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{test?.title}</h2>
            <form onSubmit={handleSubmit}>
                {test?.questions.map((q, qIndex) => (
                    <div key={q._id || qIndex} style={{ marginBottom: '25px', border: '1px solid #f0f0f0', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>{`Q${qIndex + 1}: ${q.questionText}`}</h4>
                        {q.options.map((option, oIndex) => (
                            // --- START: ALIGNMENT FIX ---
                            // Humne yahan 'label' ko container banaya hai
                            <label
                                key={oIndex}
                                htmlFor={`q${qIndex}-o${oIndex}`}
                                style={{
                                    display: 'flex', // Flexbox istemal karein
                                    alignItems: 'flex-start', // Top se align karein
                                    marginBottom: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                <input
                                    type="radio"
                                    id={`q${qIndex}-o${oIndex}`}
                                    name={`question-${qIndex}`}
                                    value={oIndex}
                                    checked={answers[qIndex] === oIndex}
                                    onChange={() => handleOptionChange(qIndex, oIndex)}
                                    // Margin-top se isko thoda neeche laayein taaki text se align ho
                                    style={{ marginRight: '12px', marginTop: '4px', flexShrink: 0 }}
                                />
                                <span>{option}</span>
                            </label>
                            // --- END: ALIGNMENT FIX ---
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