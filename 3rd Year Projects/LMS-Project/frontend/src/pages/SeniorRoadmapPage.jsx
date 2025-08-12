import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaUserTie, FaTrophy } from 'react-icons/fa';
import './SeniorRoadmapPage.css'; // Nayi CSS file import karein

// Example Data (aap isey API se fetch karenge)
const mockRoadmapData = {
    'priya-sharma': {
        seniorName: 'Priya Sharma',
        seniorRole: 'Software Engineer @ Google',
        profileImage: '/images/seniors/mentor1.jpg',
        introduction: "Success is a marathon, not a sprint. Consistency in learning and building projects was my key. Here's the path that led me to Google.",
        timeline: [
            {
                year: "First Year",
                icon: <FaBook />,
                title: "Mastering C++ & DSA Fundamentals",
                description: "Focused completely on building a strong foundation in Data Structures and Algorithms using C++. Solved over 200 problems on various platforms.",
                skills: ["C++", "DSA", "Problem Solving"]
            },
            {
                year: "Second Year",
                icon: <FaLaptopCode />,
                title: "Exploring Development & Projects",
                description: "Started learning web development (MERN stack) and built 2-3 significant projects. This helped me apply the DSA concepts I learned.",
                skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"]
            },
            {
                year: "Third Year",
                icon: <FaUserTie />,
                title: "Internship & Core Subjects",
                description: "Focused on cracking internships. Deep-dived into core CS subjects like OS, DBMS, and Computer Networks as they are frequently asked in interviews.",
                skills: ["Operating Systems", "DBMS", "CN", "System Design Basics"]
            },
            {
                year: "Fourth Year",
                icon: <FaTrophy />,
                title: "Placement Preparation & Specialization",
                description: "Dedicatedly prepared for placements by giving mock interviews and participating in coding contests. Also explored cloud technologies.",
                skills: ["Advanced Algo", "System Design", "Cloud (AWS)"]
            }
        ],
        keyAdvice: "Don't just learn, build! Your projects are proof of your skills. And never underestimate the importance of core computer science subjects."
    }
};


const SeniorRoadmapPage = () => {
    const { roadmapId } = useParams();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Abhi ke liye, hum mock data se fetch kar rahe hain
        // TODO: Is logic ko API call se replace karein (e.g., fetchRoadmapById(roadmapId))
        const data = mockRoadmapData[roadmapId];
        if (data) {
            setRoadmap(data);
        } else {
            setError('Roadmap for this senior could not be found.');
        }
        setLoading(false);
    }, [roadmapId]);

    if (loading) return <div className="roadmap-container"><p>Loading Roadmap...</p></div>;
    if (error) return <div className="roadmap-container"><p className="error-message">{error}</p></div>;
    if (!roadmap) return null;

    return (
        <div className="roadmap-container">
            <header className="roadmap-header">
                <img src={roadmap.profileImage} alt={roadmap.seniorName} className="senior-profile-pic" />
                <div className="senior-info">
                    <h1>{roadmap.seniorName}'s Career Path</h1>
                    <h2>{roadmap.seniorRole}</h2>
                    <p className="senior-intro">"{roadmap.introduction}"</p>
                </div>
            </header>

            <div className="timeline">
                {roadmap.timeline.map((item, index) => (
                    <div className="timeline-item" key={index}>
                        <div className="timeline-icon">{item.icon}</div>
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

            <Link to="/" className="back-to-home-link">Back to Home</Link>
        </div>
    );
};

export default SeniorRoadmapPage;