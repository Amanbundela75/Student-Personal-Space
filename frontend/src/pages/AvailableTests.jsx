import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import testService from '../services/TestServices.js';

const AvailableTests = () => {
    const { courseId } = useParams();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true);
                // Sahi function ko call karein
                const data = await testService.getTestsForCourse(courseId);
                setTests(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch tests.');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, [courseId]);

    if (loading) {
        return <div className="container"><h2>Loading available tests...</h2></div>;
    }

    if (error) {
        return <div className="container error-message">Error: {error}</div>;
    }

    return (
        <div className="container">
            <h2>Available Tests</h2>
            {tests.length > 0 ? (
                <ul className="item-list">
                    {tests.map(test => (
                        <li key={test._id} className="item-card">
                            <h3>{test.title}</h3>
                            <p>{test.description || 'No description available.'}</p>
                            <Link to={`/test/${test._id}/attempt`} className="button button-primary">
                                Start Test
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tests are available for this course at the moment.</p>
            )}
        </div>
    );
};

export default AvailableTests;