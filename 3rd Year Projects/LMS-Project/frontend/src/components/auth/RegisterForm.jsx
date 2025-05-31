import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { fetchBranches } from '../../api/branches'; // API call

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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth(); // Using register from AuthContext
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
                setError('Failed to load branches. Please try again later.');
                console.error(err);
            }
        };
        loadBranches();
    }, []);

    const { firstName, lastName, email, password, confirmPassword, branchId } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            const userData = { firstName, lastName, email, password, branchId };
            const response = await register(userData); // Call register from AuthContext
            if (response.success) {
                setSuccess('Registration successful! Please login.');
                setTimeout(() => navigate('/login'), 2000); // Redirect after a short delay
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div>
                <label htmlFor="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" value={firstName} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" value={lastName} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={email} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={password} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="branchId">Select Branch/Stream:</label>
                <select id="branchId" name="branchId" value={branchId} onChange={onChange} required>
                    <option value="" disabled>-- Select Branch --</option>
                    {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                </select>
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </form>
    );
};

export default RegisterForm;