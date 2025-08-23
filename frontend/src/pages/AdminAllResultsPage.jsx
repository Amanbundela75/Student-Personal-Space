import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getAllResultsAdmin } from '../api/admin.js';
import { Link } from 'react-router-dom';

const AdminAllResultsPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const fetchResults = async () => {
            if (token) {
                try {
                    const data = await getAllResultsAdmin(token);
                    setResults(data);
                } catch (err) {
                    setError('Failed to fetch results. ' + (err.response?.data?.message || err.message));
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchResults();
    }, [token]);

    if (loading) {
        return <div className="container"><h2>Loading All Student Results...</h2></div>;
    }

    if (error) {
        return <div className="container"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container">
            <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>All Student Test Results</h1>

            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <table className="table">
                    <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Test Title</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Date</th>
                        <th>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map(result => {
                        // Safe check for total marks to prevent division by zero
                        const totalMarks = result.test?.totalMarks || 0;
                        const percentage = totalMarks > 0 ? ((result.score / totalMarks) * 100).toFixed(2) : 0;

                        return (
                            <tr key={result._id}>
                                <td>{result.student ? `${result.student.firstName} ${result.student.lastName}` : 'N/A'}</td>
                                <td>{result.student ? result.student.email : 'N/A'}</td>
                                <td>{result.test ? result.test.title : 'Test Deleted'}</td>

                                {/* === SCORE FIX: totalMarks ab test object se aayega === */}
                                <td>{result.score} / {totalMarks}</td>

                                {/* === PERCENTAGE FIX: NaN% ki jagah sahi value aayegi === */}
                                <td>{percentage}%</td>

                                {/* === DATE FIX: Invalid Date ki jagah sahi date aayegi === */}
                                <td>{result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}</td>

                                <td>
                                    <Link to={`/results/${result._id}`} className="btn btn-sm">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminAllResultsPage;