import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import testService from '../services/TestServices';
import { AuthContext } from '../contexts/AuthContext';

const ResultDetailPage = () => {
    const { resultId } = useParams();
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    const [resultDetails, setResultDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token || !resultId) {
            setLoading(false);
            setError("Missing required information to fetch result details.");
            return;
        }

        const fetchResultDetails = async () => {
            try {
                setLoading(true);
                const data = await testService.getResultDetails(resultId, token);
                // --- START: DEBUGGING KE LIYE CONSOLE LOG ADD KIYA GAYA HAI ---
                console.log("Response from API (resultDetails):", data);
                // --- END: DEBUGGING LOG ---
                setResultDetails(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch result details.');
                console.error("Error fetching result details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResultDetails();
    }, [resultId, token]);

    // Helper function to find user's answer for a question
    const findUserAnswer = (questionId) => {
        // --- START: CRASH SE BACHNE KE LIYE CHECK ADD KIYA GAYA HAI ---
        // Agar resultDetails.answers array nahi hai, to error mat do, null return karo.
        if (!resultDetails?.answers || resultDetails.answers.length === 0) {
            return null;
        }
        // --- END: CHECK ---
        const answer = resultDetails.answers.find(a => a.question && a.question.toString() === questionId.toString());
        return answer ? answer.selectedOption : null;
    };

    if (loading) return <div className="container" style={{padding: '2rem'}}>Loading Result Details...</div>;
    if (error) return <div className="container" style={{ color: 'red', padding: '2rem' }}>Error: {error}</div>;

    return (
        <div className="result-detail-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <Link to="/my-results" className="button button-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to My Results
            </Link>

            <h2 style={{ textAlign: 'center' }}>Result for: {resultDetails?.test?.title}</h2>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '30px' }}>
                <strong>Your Score: {resultDetails?.score} / {resultDetails?.totalMarks}</strong>
            </div>

            {/* --- START: AGAR ANSWERS NAHI HAIN TO EK MESSAGE DIKHAO --- */}
            {(!resultDetails?.answers || resultDetails.answers.length === 0) && (
                <div style={{ padding: '20px', backgroundColor: '#fff3cd', color: '#856404', textAlign: 'center', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
                    <strong>Note:</strong> Detailed answers are not available for this result. This might be an older test attempt for which answers were not recorded.
                </div>
            )}
            {/* --- END: MESSAGE --- */}

            {resultDetails?.test?.questions.map((q, qIndex) => {
                const userAnswerIndex = findUserAnswer(q._id);
                const correctAnswerIndex = q.correctOption;

                return (
                    <div key={q._id} style={{ marginBottom: '25px', border: '1px solid #f0f0f0', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>{`Q${qIndex + 1}: ${q.questionText}`}</h4>

                        {q.options.map((option, oIndex) => {
                            let style = {};
                            // Styling tabhi karo jab answers maujood hon
                            if (resultDetails?.answers && resultDetails.answers.length > 0) {
                                if (oIndex === correctAnswerIndex) {
                                    style = { backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold' };
                                }
                                if (oIndex === userAnswerIndex && userAnswerIndex !== correctAnswerIndex) {
                                    style = { backgroundColor: '#f8d7da', color: '#721c24' };
                                }
                            }

                            return (
                                <div key={oIndex} style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', ...style }}>
                                    {option}
                                    {resultDetails?.answers && oIndex === userAnswerIndex && <span style={{fontWeight: 'bold'}}> &larr; Your Answer</span>}
                                    {resultDetails?.answers && oIndex === correctAnswerIndex && userAnswerIndex !== correctAnswerIndex && <span style={{ marginLeft: '10px' }}>(Correct Answer)</span>}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default ResultDetailPage;