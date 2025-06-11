// frontend/src/components/auth.js/LoginForm.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import FaceCaptureComponent from './FaceCaptureComponent.jsx';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [faceImage, setFaceImage] = useState(null); // Face image ke liye state
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
            // Login function ko email, password aur face image data bhejein
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
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}

            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <FaceCaptureComponent onCapture={handleFaceCaptured} />
            {faceImage && <p style={{color: 'green', textAlign: 'center'}}>Face captured, ready to login!</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </form>
    );
};

export default LoginForm;