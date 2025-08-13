// src/pages/SeniorListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import './SeniorListPage.css';

const API_URL = 'http://localhost:5001/api';

const SeniorListPage = () => {
    const [seniors, setSeniors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSeniors = async () => {
            try {
                const response = await axios.get(`${API_URL}/roadmaps`);
                setSeniors(response.data);
            } catch (err) {
                setError('Could not fetch senior roadmaps. Please try again later.');
                console.error("Fetch seniors error:", err);
            }
            setLoading(false);
        };

        fetchSeniors();
    }, []);

    if (loading) return <div className="senior-list-container"><p>Loading senior roadmaps...</p></div>;
    if (error) return <div className="senior-list-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="senior-list-container">
            <header className="senior-list-header">
                <h1>Career Roadmaps by Seniors</h1>
                <p>Learn from the journey of those who have paved the way.</p>
            </header>

            {/* === MESSAGE ADDED FOR EMPTY LIST === */}
            {seniors.length === 0 ? (
                <div className="no-roadmaps-message">
                    <p>No roadmaps are available at the moment. Please check back later.</p>
                </div>
            ) : (
                <div className="senior-grid">
                    {seniors.map(senior => (
                        <div className="senior-card" key={senior._id}>
                            <img src={senior.profileImage} alt={senior.seniorName} className="senior-card-img" />
                            <div className="senior-card-content">
                                <h3>{senior.seniorName}</h3>
                                <p className="senior-card-role">{senior.seniorRole}</p>
                                <p className="senior-card-intro">"{senior.introduction}"</p>
                                <Link to={`/seniors/${senior.slug}`} className="senior-card-link">
                                    View Full Roadmap <FaArrowRight />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* ================================== */}
        </div>
    );
};

export default SeniorListPage;