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
    const [faceImage, setFaceImage] = useState(null); // base64 string

    const [error, setError] = useState('');
    // Success message ke liye ab state ki zaroorat nahi, kyunki hum alert use karenge.
    // const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadBranches = async () => {
            try {
                const fetchedBranches = await fetchBranches();
                setBranches(fetchedBranches || []);
                if (fetchedBranches && fetchedBranches.length > 0) {
                    setFormData(prev => ({ ...prev, branchId: fetchedBranches[0]._id }));
                }
            } catch (err) {
                setError('Failed to load branches.');
            }
        };
        loadBranches();
    }, [setError]);

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
                // --- UPDATE YAHAN HAI ---
                // User ko confirmation ke liye ek dialogue box (alert) dikhayein.
                alert(response.message || 'Registration successful! Please check your email to verify.');

                // Alert band karne ke baad user ko login page par bhej dein.
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
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h2>Register</h2>
            {error && <p className="error-message">{error}</p>}

            {/* Success message wala <p> tag hata diya hai */}

            <div><label>First Name:</label><input type="text" name="firstName" value={firstName} onChange={onChange} required /></div>
            <div><label>Last Name:</label><input type="text" name="lastName" value={lastName} onChange={onChange} required /></div>
            <div><label>Email:</label><input type="email" name="email" value={email} onChange={onChange} required /></div>
            <div><label>Password:</label><input type="password" name="password" value={password} onChange={onChange} required /></div>
            <div><label>Confirm Password:</label><input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required /></div>

            <div>
                <label>Select Branch:</label>
                <select name="branchId" value={branchId} onChange={onChange} required>
                    <option value="" disabled>-- Select Branch --</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </div>

            <div>
                <label>Upload ID Card:</label>
                <input type="file" name="idCard" onChange={handleIdCardChange} accept="image/*" required />
            </div>

            <FaceCaptureComponent onCapture={handleFaceCaptured} />
            {faceImage && <p style={{color: 'green', textAlign: 'center'}}>Face captured!</p>}

            <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
        </form>
    );
};

export default RegisterForm;