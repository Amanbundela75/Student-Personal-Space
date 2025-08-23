import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig.js';

const TestManagementPage = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/tests');
            // --- FIX YAHAN HAI ---
            // Ab hum seedha response.data ka istemaal karenge
            setTests(response.data || []);
        } catch (err) {
            // --- YEAH MESSAGE ENGLISH MEIN KAR DIYA GAYA HAI ---
            setError('Failed to fetch tests. Please try again later.');
            console.error('Error fetching tests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleDelete = async (id) => {
        // --- YEAH MESSAGE ENGLISH MEIN KAR DIYA GAYA HAI ---
        if (window.confirm('Are you sure you want to delete this test?')) {
            try {
                await apiClient.delete(`/api/tests/${id}`);
                setTests(tests.filter(test => test._id !== id));
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to delete the test.';
                setError(errorMessage);
                console.error(`Error deleting test with id ${id}:`, err);
            }
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Test Management</h1>
                <Link to="/admin/tests/create" className="button button-primary">
                    Create New Test
                </Link>
            </div>

            {loading && <p>Loading tests...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Course</th>
                            <th>Branch</th>
                            <th>Questions</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tests.length > 0 ? (
                            tests.map(test => (
                                <tr key={test._id}>
                                    <td>{test.title}</td>
                                    <td>{test.course?.title || 'N/A'}</td>
                                    <td>{test.branch?.name || 'N/A'}</td>
                                    <td>{test.questions?.length || 0}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(test._id)}
                                            className="button button-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* --- YEAH MESSAGE BHI ENGLISH MEIN KAR DIYA GAYA HAI --- */}
                                <td colSpan="5">No tests found. Click "Create New Test" to add one.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TestManagementPage;