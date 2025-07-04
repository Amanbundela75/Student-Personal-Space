import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { fetchBranches } from '../../api/branches.js';
import FaceCaptureComponent from './FaceCaptureComponent.jsx';

const RegisterForm = () => {
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
        if (e.target.files && e.target.files[0]) {
            setIdCardImage(e.target.files[0]);
        }
    };

    const handleFaceCaptured = (imageDataUrl) => {
        setFaceImage(imageDataUrl);
    };

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
        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ marginTop: '1.5rem' }}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" value={firstName} onChange={onChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={lastName} onChange={onChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={email} onChange={onChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={password} onChange={onChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="branchId">Select Branch</label>
                {/* Note: We need to add styling for 'select' in index.css for it to look perfect */}
                <select id="branchId" name="branchId" value={branchId} onChange={onChange} required style={{width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px'}}>
                    <option value="" disabled>-- Select your branch --</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="idCard">Upload ID Card</label>
                <input type="file" id="idCard" name="idCard" onChange={handleIdCardChange} accept="image/*" required />
            </div>
            <div className="form-group">
                <label>Face Capture</label>
                <FaceCaptureComponent onCapture={handleFaceCaptured} />
                {faceImage && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>Face captured!</p>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Registering...' : 'Register'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </form>
    );
};

export default RegisterForm;