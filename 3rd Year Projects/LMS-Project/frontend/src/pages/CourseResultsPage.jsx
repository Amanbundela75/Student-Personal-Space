// src/pages/CourseResultsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './CourseResultsPage.css'; // Nayi CSS file import karein

const API_URL = 'http://localhost:5001/api';

const CourseResultsPage = () => {
    const { courseId } = useParams();
    const { token } = useAuth();
    const [results, setResults] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            if (!token || !courseId) {
                setError('Authentication token or Course ID is missing.');
                setLoading(false);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Nayi API se results fetch karein
                const response = await axios.get(`${API_URL}/tests/my-results/${courseId}`, config);
                setResults(response.data);

                // Course ka naam set karein (agar results mein hai)
                if (response.data.length > 0 && response.data[0].test.course) {
                    // Note: Yeh maankar chal rahe hain ki test.course populate hoga
                    // Humne controller mein yeh nahi kiya hai, so we'll just show the generic title for now.
                    // A better approach would be to fetch course details separately.
                }

            } catch (err) {
                setError('Failed to fetch results for this course.');
                console.error('Fetch course results error:', err);
            }
            setLoading(false);
        };

        fetchResults();
    }, [courseId, token]);

    if (loading) return <div className="results-container"><p>Loading results...</p></div>;
    if (error) return <div className="results-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="results-container">
            <header className="results-header">
                <h1>Test Results</h1>
                {/* Agar course title milta hai, toh use dikhayein */}
                {courseTitle && <p className="course-subtitle">For course: {courseTitle}</p>}
            </header>

            {results.length === 0 ? (
                <div className="no-results-message">
                    <p>You have not attempted any tests for this course yet.</p>
                    <Link to="/courses" className="button button-secondary">Explore Other Courses</Link>
                </div>
            ) : (
                <div className="results-list">
                    {results.map(result => (
                        <div key={result._id} className="result-card">
                            <div className="result-card-header">
                                <h3>{result.test.title}</h3>
                            </div>
                            <div className="result-card-body">
                                <div className="score-display">
                                    <span className="achieved-score">{result.score}</span>
                                    <span className="total-score">/ {result.test.totalMarks}</span>
                                </div>
                                <p className="submission-date">
                                    Submitted on: {new Date(result.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="result-card-footer">
                                <Link to={`/results/${result._id}`} className="button button-primary">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Link to="/my-courses" className="button" style={{marginTop: '2rem'}}>Back to My Courses</Link>
        </div>
    );
};

export default CourseResultsPage;