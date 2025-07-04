import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import FaceCaptureComponent from './FaceCaptureComponent.jsx';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [faceImage, setFaceImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleFaceCaptured = (imageDataUrl) => {
        setFaceImage(imageDataUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!faceImage) {
            setError('Please capture your face to log in.');
            return;
        }

        setLoading(true);
        try {
            const response = await login(email, password, faceImage);
            if (response.success) {
                if (response.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            } else {
                setError(response.message || 'Login failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Error message ko top par rakhein */}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Face Capture</label>
                <FaceCaptureComponent onCapture={handleFaceCaptured} />
                {faceImage && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>Face captured, ready to login!</p>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </form>
    );
};

export default LoginForm;