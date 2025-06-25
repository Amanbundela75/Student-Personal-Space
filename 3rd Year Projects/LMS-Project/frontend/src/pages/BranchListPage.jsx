import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // API client ko seedha yahan istemaal kar rahe hain
import { Link } from 'react-router-dom';

const BranchListPage = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBranches = async () => {
            setLoading(true);
            try {
                // Hum seedha yahan API call kar rahe hain
                const response = await apiClient.get('/api/branches');

                // --- YAHAN HAI ASLI FIX ---
                // Pehle: setBranches(response.data || []);
                // Ab: Hum response.data ke andar se 'data' array nikal rahe hain
                setBranches(response.data.data || []);

                setError('');
            } catch (err) {
                setError('Failed to load branches. Please try again later.');
                console.error(err);
            }
            setLoading(false);
        };
        loadBranches();
    }, []);

    if (loading) return <p>Loading branches...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="container">
            <h1>Explore Our Branches</h1>
            {branches.length === 0 ? (
                <p>No branches available at the moment.</p>
            ) : (
                <div className="card-list">
                    {branches.map(branch => (
                        <div key={branch._id} className="card branch-card">
                            <div className="card-content">
                                <h3>{branch.name}</h3>
                                <p>{branch.description || 'No description available.'}</p>
                            </div>
                            <div className="card-actions">
                                <Link to={`/courses?branchId=${branch._id}`} className="button button-primary button-full-width">
                                    View Courses in {branch.name}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BranchListPage;