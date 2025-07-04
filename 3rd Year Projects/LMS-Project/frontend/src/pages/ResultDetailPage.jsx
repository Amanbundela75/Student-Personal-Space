import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate ko import karein
import testService from '../services/TestServices';
import { AuthContext } from '../contexts/AuthContext';

const ResultDetailPage = () => {
    const { resultId } = useParams();
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;
    const navigate = useNavigate(); // useNavigate ko initialize karein

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
                console.log("API se mila data (resultDetails):", data); // Debugging ke liye
                setResultDetails(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch result details.');
                console.error("Result details laane mein error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResultDetails();
    }, [resultId, token]);

    const findUserAnswer = (questionId) => {
        // Crash se bachne ke liye check karein ki answers array maujood hai ya nahi
        if (!resultDetails?.answers || resultDetails.answers.length === 0) {
            return null;
        }
        const answer = resultDetails.answers.find(a => a.question && a.question.toString() === questionId.toString());
        return answer ? answer.selectedOption : null;
    };

    if (loading) return <div className="container" style={{padding: '2rem'}}>Loading Result Details...</div>;
    if (error) return <div className="container" style={{ color: 'red', padding: '2rem' }}>Error: {error}</div>;

    return (
        <div className="result-detail-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            {/* --- START: BADLAV --- "Back" button ko behtar banayein */}
            <button onClick={() => navigate(-1)} className="button button-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
                &larr; Go Back
            </button>
            {/* --- END: BADLAV --- */}

            <h2 style={{ textAlign: 'center' }}>Result for: {resultDetails?.test?.title}</h2>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '30px' }}>
                <strong>Your Score: {resultDetails?.score} / {resultDetails?.totalMarks}</strong>
            </div>

            {/* Agar answers nahi hain to ek message dikhao */}
            {(!resultDetails?.answers || resultDetails.answers.length === 0) && (
                <div style={{ padding: '20px', backgroundColor: '#fff3cd', color: '#856404', textAlign: 'center', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
                    <strong>Note:</strong> Detailed answers are not available for this result.
                </div>
            )}

            {resultDetails?.test?.questions.map((q, qIndex) => {
                const userAnswerIndex = findUserAnswer(q._id);
                const correctAnswerIndex = q.correctOption;

                return (
                    <div key={q._id} style={{ marginBottom: '25px', border: '1px solid #f0f0f0', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>{`Q${qIndex + 1}: ${q.questionText}`}</h4>
                        {q.options.map((option, oIndex) => {
                            let style = {};
                            if (resultDetails?.answers?.length > 0) {
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