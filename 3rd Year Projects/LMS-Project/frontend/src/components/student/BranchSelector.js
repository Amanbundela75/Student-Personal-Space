// frontend/src/components/student/BranchSelector.js
import React, { useState, useEffect } from 'react';
import { fetchBranches } from '../../api/branches';
import { updateUserProfileApi, fetchUserProfile } from '../../api/profile'; // Assuming profile API can update branch
import { useAuth } from '../../contexts/AuthContext.jsx';

const BranchSelector = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [currentBranchName, setCurrentBranchName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { currentUser, token, updateUserContext } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError('');
            try {
                const fetchedBranches = await fetchBranches();
                setBranches(fetchedBranches || []);

                if (currentUser && token) {
                    const userProfile = await fetchUserProfile(token);
                    setSelectedBranchId(userProfile.branch?._id || '');
                    setCurrentBranchName(userProfile.branch?.name || 'Not selected');
                }
            } catch (err) {
                console.error("Failed to load data:", err);
                setError('Failed to load branches or user profile.');
            }
            setLoading(false);
        };

        loadData();
    }, [currentUser, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBranchId) {
            setError('Please select a branch.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // We only need to send the branchId for this specific update purpose.
            // The backend's updateUserProfile should handle partial updates.
            const response = await updateUserProfileApi({ branchId: selectedBranchId }, token);
            if (response.success) {
                setSuccess('Branch updated successfully!');
                // Update context and local state if necessary
                updateUserContext(response); // Assuming this updates the currentUser in AuthContext
                const updatedProfile = await fetchUserProfile(token); // Re-fetch to get updated name
                setCurrentBranchName(updatedProfile.branch?.name || 'Not selected');

            } else {
                setError(response.message || 'Failed to update branch.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while updating your branch.');
        }
        setLoading(false);
    };

    if (!currentUser) {
        return <p>Please log in to select or change your branch.</p>;
    }
    if (currentUser.user?.role === 'admin') {
        return <p>Branch selection is for student accounts.</p>;
    }

    return (
        <div className="container" style={{maxWidth: "600px"}}>
            <h3>Select Your Preferred Branch</h3>
            <p>Your current branch: <strong>{currentBranchName}</strong></p>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="branchSelect">Choose Branch:</label>
                    <select
                        id="branchSelect"
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        disabled={loading}
                        required
                    >
                        <option value="" disabled>-- Select a Branch --</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={loading || branches.length === 0}>
                    {loading ? 'Updating...' : 'Save Branch Selection'}
                </button>
            </form>
        </div>
    );
};

export default BranchSelector;