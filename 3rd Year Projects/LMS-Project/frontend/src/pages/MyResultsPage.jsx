import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import testService from '../services/TestServices.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

const MyResultsPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError("You must be logged in to see results.");
            return;
        }

        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await testService.getMyResults(token);
                setResults(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch results.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [token]);

    if (loading) return <div className="container">Loading Your Results...</div>;
    if (error) return <div className="container" style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div className="my-results-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>My Test Results</h2>

            {results.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                    <h3>No Results Found</h3>
                    <p>It looks like you haven't attempted any tests yet.</p>
                    <Link to="/courses">
                        <button className="button button-primary" style={{ marginTop: '10px' }}>
                            Find a Test
                        </button>
                    </Link>
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Test Title</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Score</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Submitted On</th>
                        {/* --- START: NAYA COLUMN ADD KIYA GAYA --- */}
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                        {/* --- END: NAYA COLUMN ADD KIYA GAYA --- */}
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((result) => (
                        <tr key={result._id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{result.test?.title || 'Test Title Not Available'}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{`${result.score} / ${result.totalMarks}`}</td>
                            <td style={{ padding: '12px' }}>{new Date(result.submittedAt).toLocaleDateString()}</td>
                            {/* --- START: NAYA BUTTON ADD KIYA GAYA --- */}
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <Link to={`/results/${result._id}`}>
                                    <button className="button button-secondary">
                                        View Details
                                    </button>
                                </Link>
                            </td>
                            {/* --- END: NAYA BUTTON ADD KIYA GAYA --- */}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyResultsPage;