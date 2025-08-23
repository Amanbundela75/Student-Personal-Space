import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaUserTie, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import './SeniorRoadmapPage.css';

const API_URL = 'http://localhost:5001'; // Backend URL

const iconMap = {
    "First Year": <FaBook />,
    "Second Year": <FaLaptopCode />,
    "Third Year": <FaUserTie />,
    "Fourth Year": <FaTrophy />,
    default: <FaBook />
};

const SeniorRoadmapPage = () => {
    const { roadmapId } = useParams();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/roadmaps/${roadmapId}`);
                setRoadmap(response.data);
            } catch (err) {
                setError('Roadmap for this senior could not be found.');
            }
            setLoading(false);
        };

        if (roadmapId) {
            fetchRoadmap();
        }
    }, [roadmapId]);

    if (loading) return <div className="roadmap-container"><p>Loading Roadmap...</p></div>;
    if (error) return <div className="roadmap-container"><p className="error-message">{error}</p></div>;
    if (!roadmap) return null;

    return (
        <div className="roadmap-container">
            <header className="roadmap-header">
                {/* === IMAGE PATH CORRECTED HERE === */}
                <img
                    src={`${API_URL}${roadmap.profileImage}`}
                    alt={roadmap.seniorName}
                    className="senior-profile-pic"
                />
                <div className="senior-info">
                    <h1>{roadmap.seniorName}'s Career Path</h1>
                    <h2>{roadmap.seniorRole}</h2>
                    <p className="senior-intro">"{roadmap.introduction}"</p>
                </div>
            </header>

            <div className="timeline">
                {roadmap.timeline.map((item, index) => (
                    <div className="timeline-item" key={item._id || index}>
                        <div className="timeline-icon">{iconMap[item.year] || iconMap.default}</div>
                        <div className="timeline-content">
                            <span className="timeline-year">{item.year}</span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <div className="skill-tags">
                                {item.skills.map(skill => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="roadmap-footer">
                <h3>Final Words of Advice</h3>
                <p>"{roadmap.keyAdvice}"</p>
            </footer>

            <Link to="/roadmaps" className="back-to-home-link">Back to All Roadmaps</Link>
        </div>
    );
};

export default SeniorRoadmapPage;