import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import testService from '../services/TestServices.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

const AvailableTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { courseId } = useParams();
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    useEffect(() => {
        // --- START: BROWSER DEBUGGING CODE ---
        console.log("[Debug] AvailableTests Component Mounted.");
        console.log("[Debug] Course ID from URL:", courseId);
        console.log("[Debug] Token from AuthContext:", token ? "Token Found" : "Token NOT Found");
        // --- END: BROWSER DEBUGGING CODE ---

        if (!token) {
            console.log("[Debug] Token is missing. Setting error and stopping.");
            setError("Please log in to see available tests.");
            setLoading(false);
            return;
        }

        const fetchTests = async () => {
            try {
                setLoading(true);
                console.log(`[Debug] Calling API: testService.getTests for courseId: ${courseId}`); // Request se pehle log
                const data = await testService.getTests(courseId, token);
                console.log("[Debug] API Response Received:", data); // Response ke baad log
                setTests(data);
                setError('');
            } catch (err) {
                // Error ko poori detail ke saath log karein
                console.error("[Debug] ERROR fetching tests:", err.response || err.message || err);
                setError(err.response?.data?.message || 'Failed to fetch tests. Check browser console for details.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchTests();
        } else {
            console.log("[Debug] No courseId found in URL. Not fetching tests.");
            setLoading(false);
        }
    }, [courseId, token]); // Dependencies bilkul sahi hain

    if (loading) {
        return <div className="container">Loading available tests...</div>;
    }

    if (error) {
        return <div className="container" style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="available-tests-container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Available Tests</h2>
                {/* Yeh link user ko wapas course study page par le jayega */}
                <Link to={`/course/${courseId}/study`} className="button">
                    Back to Course
                </Link>
            </div>

            {tests.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                    <h3>No Tests Available</h3>
                    <p>There are currently no tests available for this course. Please check back later.</p>
                </div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {tests.map((test) => (
                        <li key={test._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0' }}>{test.title}</h3>
                                <p style={{ margin: 0 }}>Duration: {test.duration || 'N/A'} minutes</p>
                            </div>
                            <Link to={`/test/${test._id}/attempt`}>
                                <button className="button button-primary" style={{ padding: '10px 20px', cursor: 'pointer' }}>Start Test</button>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AvailableTests;