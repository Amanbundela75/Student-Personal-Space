import React, { useState } from 'react';
import { submitFeedback } from '../../api/feedback';

const FeedbackForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            await submitFeedback({ name, email, message });
            setSuccess('Thank you! Your feedback has been submitted.');
            setName('');
            setEmail('');
            setMessage('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to submit feedback, please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feedback-form-container">
            <h3>Share Your Feedback</h3>
            <form onSubmit={handleSubmit} className="feedback-form">
                <div>
                    <label htmlFor="name">Your Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Your Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message">Your Feedback</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                        maxLength={1000}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default FeedbackForm;