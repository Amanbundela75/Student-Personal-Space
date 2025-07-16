import React, { useEffect, useState } from 'react';
import { getAllFeedback } from '../../api/feedback';

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFeedback = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getAllFeedback();
                setFeedbacks(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to fetch feedback.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    return (
        <div className="feedback-list-container">
            <h3>All Users Feedback</h3>
            {loading && <p>Loading feedback...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && feedbacks.length === 0 && <p>No feedback yet.</p>}
            <ul className="feedback-list">
                {feedbacks.map(fb => (
                    <li key={fb._id} className="feedback-item">
                        <p>
                            <strong>{fb.name}</strong> ({fb.email})<br />
                            <span>{new Date(fb.createdAt).toLocaleString()}</span>
                        </p>
                        <p>{fb.message}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FeedbackList;