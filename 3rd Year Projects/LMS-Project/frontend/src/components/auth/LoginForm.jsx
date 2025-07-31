import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import FaceCaptureComponent from './FaceCaptureComponent.jsx';

const LoginForm = () => {
    // Form data ke liye ek state object use karna behtar hai
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [faceImage, setFaceImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Generic function to handle input changes
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFaceCaptured = (imageDataUrl) => {
        setFaceImage(imageDataUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            return setError('Please provide both email and password.');
        }
        if (!faceImage) {
            return setError('Please capture your face to log in.');
        }

        setLoading(true);
        try {
            // Destructure email and password from formData
            const { email, password } = formData;
            const response = await login(email, password, faceImage);

            if (response.success) {
                // Role-based redirection
                if (response.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            } else {
                // Backend se aaya specific error message dikhana
                setError(response.message || 'Login failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email" // name attribute zaroori hai
                    value={formData.email}
                    onChange={onChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password" // name attribute zaroori hai
                    value={formData.password}
                    onChange={onChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Face Capture</label>
                <FaceCaptureComponent onCapture={handleFaceCaptured} />
                {faceImage && <p className="success-message">Face captured, ready to login!</p>}
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="form-footer-link">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </form>
    );
};

export default LoginForm;