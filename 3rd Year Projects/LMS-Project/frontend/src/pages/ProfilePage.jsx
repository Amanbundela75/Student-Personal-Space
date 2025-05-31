import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchUserProfile, updateUserProfileApi } from '../api/profile';
import { fetchBranches } from '../api/branches';

const ProfilePage = () => {
    const { currentUser, token, updateUserContext } = useAuth();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '', // Email might not be editable by user, depends on policy
        branchId: '',
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadProfileAndBranches = async () => {
            if (token) {
                setLoading(true);
                try {
                    const userProfile = await fetchUserProfile(token);
                    setProfileData({
                        firstName: userProfile.firstName || '',
                        lastName: userProfile.lastName || '',
                        email: userProfile.email || '',
                        branchId: userProfile.branch?._id || '',
                    });

                    if (currentUser?.user?.role === 'student') {
                        const fetchedBranches = await fetchBranches();
                        setBranches(fetchedBranches || []);
                    }
                    setError('');
                } catch (err) {
                    setError('Failed to load profile data.');
                    console.error(err);
                }
                setLoading(false);
            }
        };
        loadProfileAndBranches();
    }, [token, currentUser]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        if (e.target.name === 'newPassword') setNewPassword(e.target.value);
        if (e.target.name === 'confirmNewPassword') setConfirmNewPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const updatePayload = { ...profileData };

        if (newPassword) {
            if (newPassword !== confirmNewPassword) {
                setError('New passwords do not match.');
                setLoading(false);
                return;
            }
            if (newPassword.length < 6) {
                setError('New password must be at least 6 characters long.');
                setLoading(false);
                return;
            }
            updatePayload.password = newPassword;
        }
        // Ensure branchId is null if empty string (to unset branch if desired)
        if(updatePayload.branchId === '') updatePayload.branchId = null;


        try {
            const response = await updateUserProfileApi(updatePayload, token);
            if (response.success) {
                setSuccess('Profile updated successfully!');
                updateUserContext(response); // Update AuthContext
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                setError(response.message || 'Failed to update profile.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile.');
        }
        setLoading(false);
    };

    if (loading && !profileData.email) return <p>Loading profile...</p>; // Initial load
    if (!currentUser) return <p>Please log in to view your profile.</p>;

    return (
        <div className="container">
            <h2>My Profile</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" value={profileData.firstName} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" value={profileData.lastName} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={profileData.email} disabled />
                    {/* Email is usually not editable by user to maintain identity */}
                </div>

                {currentUser?.user?.role === 'student' && branches.length > 0 && (
                    <div>
                        <label htmlFor="branchId">My Branch/Stream:</label>
                        <select id="branchId" name="branchId" value={profileData.branchId} onChange={handleChange}>
                            <option value="">-- Select Branch --</option>
                            {branches.map(branch => (
                                <option key={branch._id} value={branch._id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <hr style={{margin: "20px 0"}}/>
                <h4>Change Password (Optional)</h4>
                <div>
                    <label htmlFor="newPassword">New Password:</label>
                    <input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={handlePasswordChange} />
                </div>
                <div>
                    <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                    <input type="password" id="confirmNewPassword" name="confirmNewPassword" value={confirmNewPassword} onChange={handlePasswordChange} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;