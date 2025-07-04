import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getAllResultsAdmin } from '../api/admin.js';
import { Link } from 'react-router-dom';

const AdminAllResultsPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // --- START: BADLAV YAHAN KIYA GAYA HAI ---
    // authState ki jagah seedhe token ko nikalein
    const { token } = useAuth();
    // --- END: BADLAV YAHAN KIYA GAYA HAI ---

    useEffect(() => {
        const fetchResults = async () => {
            // Check karein ki token maujood hai ya nahi
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
                // Agar token nahi hai, to loading band kar dein.
                // Auth context abhi bhi token laa raha ho sakta hai,
                // lekin hum yahan ek chhota sa delay de sakte hain ya loading false kar sakte hain.
                // Abhi ke liye, hum maan rahe hain ki agar token nahi hai to user logged in nahi hai.
                setLoading(false);
                // Aap yahan ek error bhi set kar sakti hain, jaise:
                // setError("You must be logged in to view results.");
            }
        };

        fetchResults();
    }, [token]); // Dependency array mein token rakhein

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
                    {results.map(result => (
                        <tr key={result._id}>
                            <td>{result.student ? `${result.student.firstName} ${result.student.lastName}` : 'N/A'}</td>
                            <td>{result.student ? result.student.email : 'N/A'}</td>
                            <td>{result.test ? result.test.title : 'Test Deleted'}</td>
                            <td>{result.score} / {result.totalMarks}</td>
                            <td>{((result.score / result.totalMarks) * 100).toFixed(2)}%</td>
                            <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                            <td>
                                <Link to={`/results/${result._id}`} className="btn btn-sm">
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminAllResultsPage;