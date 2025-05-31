import React, { useState, useEffect } from 'react';
import { fetchBranches } from '../api/branches.js';
import { Link } from 'react-router-dom';

const BranchListPage = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBranches = async () => {
            setLoading(true);
            try {
                const data = await fetchBranches();
                setBranches(data || []);
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
                        <div key={branch._id} className="card">
                            <h3>{branch.name}</h3>
                            <p>{branch.description || 'No description available.'}</p>
                            <div className="card-actions"> {/* Add this wrapper */}
                                <Link to={`/courses?branchId=${branch._id}`} className="button button-primary">
                                    View Courses in {branch.name}
                                </Link>
                                {/* If you had another button, it would go here and flexbox + gap would manage spacing */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BranchListPage;