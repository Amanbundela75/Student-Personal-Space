import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/TestServices';
import { AuthContext } from '../contexts/AuthContext';

const ResultDetailPage = () => {
    const { resultId } = useParams();
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;
    const navigate = useNavigate();

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

    if (loading) return <div className="container" style={{padding: '2rem'}}>Loading Result Details...</div>;
    if (error) return <div className="container" style={{ color: 'red', padding: '2rem' }}>Error: {error}</div>;

    return (
        <div className="result-detail-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <button onClick={() => navigate(-1)} className="button button-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
                &larr; Go Back
            </button>

            <h2 style={{ textAlign: 'center' }}>Result for: {resultDetails?.test?.title}</h2>
            {/* --- UPDATE 1: Score ko 'resultDetails.test.totalMarks' se liya gaya hai --- */}
            <div style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '30px', fontWeight: 'bold' }}>
                Your Score: {resultDetails?.score} / {resultDetails?.test?.totalMarks || ''}
            </div>

            {resultDetails?.test?.questions.map((q, qIndex) => {
                // --- UPDATE 2: User ka answer ab seedhe array index se milega ---
                const userAnswerIndex = resultDetails?.answers ? resultDetails.answers[qIndex] : null;
                const correctAnswerIndex = q.correctOption;

                return (
                    <div key={q._id} style={{ marginBottom: '25px', border: '1px solid #f0f0f0', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>{`Q${qIndex + 1}: ${q.questionText}`}</h4>
                        {q.options.map((option, oIndex) => {
                            let style = {};
                            const isUserAnswer = oIndex === userAnswerIndex;
                            const isCorrectAnswer = oIndex === correctAnswerIndex;

                            // --- UPDATE 3: Highlighting logic ko saral aur sahi banaya gaya hai ---
                            // Case 1: Agar user ka jawab sahi hai, to use green karein
                            if (isUserAnswer && isCorrectAnswer) {
                                style = { backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold' };
                            }
                            // Case 2: Agar user ka jawab galat hai
                            else if (isUserAnswer && !isCorrectAnswer) {
                                style = { backgroundColor: '#f8d7da', color: '#721c24' }; // User ke galat jawab ko red karein
                            }
                            // Case 3: Sahi jawab (agar user ne galat chuna hai to)
                            else if (isCorrectAnswer) {
                                style = { backgroundColor: '#d4edda', color: '#155724' }; // Sahi jawab ko green karein
                            }

                            return (
                                <div key={oIndex} style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', ...style }}>
                                    {option}
                                    {isUserAnswer && <span style={{fontWeight: 'bold'}}> &larr; Your Answer</span>}
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