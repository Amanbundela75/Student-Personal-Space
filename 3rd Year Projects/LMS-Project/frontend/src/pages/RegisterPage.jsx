import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchBranches } from '../api/branches.js';
import FaceCaptureComponent from '../components/auth/FaceCaptureComponent.jsx';
import './RegisterPage.css'; // Nayi CSS file import karein

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        branchId: '',
    });
    const [branches, setBranches] = useState([]);
    const [idCardImage, setIdCardImage] = useState(null);
    const [faceImage, setFaceImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadBranches = async () => {
            try {
                const fetchedBranches = await fetchBranches();
                setBranches(fetchedBranches || []);
            } catch (err) {
                setError('Failed to load branches.');
            }
        };
        loadBranches();
    }, []);

    const { firstName, lastName, email, password, confirmPassword, branchId } = formData;
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleIdCardChange = (e) => {
        if (e.target.files && e.target.files[0]) setIdCardImage(e.target.files[0]);
    };
    const handleFaceCaptured = (imageDataUrl) => setFaceImage(imageDataUrl);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) return setError('Passwords do not match');
        if (password.length < 6) return setError('Password must be at least 6 characters long.');
        if (!branchId) return setError('Please select your branch.');
        if (!idCardImage) return setError('Please upload your ID card.');
        if (!faceImage) return setError('Please capture your face image.');
        setLoading(true);
        const registrationData = new FormData();
        registrationData.append('firstName', firstName);
        registrationData.append('lastName', lastName);
        registrationData.append('email', email);
        registrationData.append('password', password);
        registrationData.append('branchId', branchId);
        registrationData.append('idCardImage', idCardImage);
        registrationData.append('faceImageBase64', faceImage);
        try {
            const response = await register(registrationData);
            if (response.success) {
                alert(response.message || 'Registration successful! Please check your email to verify.');
                navigate('/login');
            } else {
                setError(response.message || 'Registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        }
        setLoading(false);
    };

    return (
        <div className="register-page-container">
            {/* --- Left Panel --- */}
            <div className="left-panel">
                <div className="logo">
                    <span className="nation">Aman's</span> <span className="skillup">LMS</span>
                </div>
                <h1 className="tagline">A Mission To Level Up Your Skills!</h1>
                <p className="description">
                    Join our platform to access top courses, track your progress, and boost your skills with expert-curated content.
                </p>
                <div className="feature-box">Day-Wise Learning</div>
                <div className="feature-box">Quizzes, Practice Problems & Projects</div>
                <div className="feature-box">Be Industry-Ready</div>
            </div>

            {/* --- Right Panel (Form) --- */}
            <div className="right-panel">
                <div className="register-form-card">
                    <h2>Create Your Account</h2>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <input type="text" id="firstName" name="firstName" value={firstName} onChange={onChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <input type="text" id="lastName" name="lastName" value={lastName} onChange={onChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input type="email" id="email" name="email" value={email} onChange={onChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <input type="password" id="password" name="password" value={password} onChange={onChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="branchId">Select Branch *</label>
                            <select id="branchId" name="branchId" value={branchId} onChange={onChange} required>
                                <option value="" disabled>-- Select your branch --</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="idCard">Upload ID Card *</label>
                            <label className="custom-file-input">
                                {idCardImage ? idCardImage.name : "Choose File"}
                                <input type="file" id="idCard" name="idCard" onChange={handleIdCardChange} accept="image/*" required />
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Live Face Capture *</label>
                            <FaceCaptureComponent onCapture={handleFaceCaptured} />
                            {faceImage && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>Face captured successfully!</p>}
                        </div>

                        <button type="submit" className="btn-register" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Now'}
                        </button>

                        <p className="login-link">
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;