import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// --- Icons ka import update kiya gaya hai ---
import { FaBook, FaAward, FaFlask, FaCalendarCheck, FaPlus, FaProjectDiagram, FaPencilAlt, FaGithub, FaImage, FaLink, FaTimes } from 'react-icons/fa';
import './StudentDashboardPage.css';

// --- Reusable Modal Component ---
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
            {children}
        </div>
    </div>
);


const StudentDashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Modal States ---
    const [modal, setModal] = useState({ type: null, data: null }); // type: 'academics', 'project', 'share'

    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            if (!token) throw new Error('Authentication token not found. Please log in.');

            // --- Dummy Data with new fields ---
            const basicInfo = {
                firstName: lmsUser.user.firstName,
                lastName: lmsUser.user.lastName,
                email: lmsUser.user.email,
                createdAt: lmsUser.user.createdAt,
                branch: { name: "Computer Science" },
                enrolledCourses: [],
            };

            const fullUserData = {
                ...basicInfo,
                academics: { currentSemester: 6, cgpa: 8.75, sgpa: 9.1 },
                projects: [
                    { _id: 'p1', title: 'AI-Powered Proctoring System', description: 'Developed a system to monitor students during online exams using TensorFlow.js.', status: 'Completed', githubLink: 'https://github.com/Amanbundela75/LMS-Project-Frontend' },
                    { _id: 'p2', title: 'Learning Management System', description: 'The platform we are currently using, built with the MERN stack.', status: 'In Progress', githubLink: 'https://github.com/Amanbundela75/LMS-Project-Frontend' }
                ],
                activityFeed: [
                    { _id: 'a1', type: 'conference', content: 'Attended the National Developer Conference 2025. Learned a lot about WebAssembly!', date: '2025-07-15T10:00:00.000Z', mediaUrl: '/images/conference_pic.jpg', link: 'https://devconf.example.com' },
                    { _id: 'a2', type: 'achievement', content: 'Became a 5-star coder on HackerRank in Python. Such a great feeling of accomplishment!', date: '2025-07-10T12:30:00.000Z', mediaUrl: null, link: null }
                ]
            };

            setUserData(fullUserData);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // --- Data Handling Functions ---
    const handleSave = (type, data) => {
        // TODO: Yahan API call karke backend mein data save karna hai
        console.log("Saving:", type, data);
        if (type === 'academics') {
            setUserData(prev => ({ ...prev, academics: data }));
        }
        // ... projects aur activity ke liye bhi logic add karna hai
        setModal({ type: null, data: null }); // Modal band kar do
    };

    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!userData) return <div className="container"><p>No user data available.</p></div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome back, {userData.firstName}!</h1>
                <p>Here's your professional and academic snapshot.</p>
            </header>

            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="left-column">
                    <div className="dashboard-card">
                        <h3 className="card-header">
                            <FaBook /> Academic Summary
                            <button className="button-edit-icon" onClick={() => setModal({ type: 'academics', data: userData.academics })}><FaPencilAlt /></button>
                        </h3>
                        <div className="academic-stats">
                            <div className="stat-item"><span>Current Semester</span><strong>{userData.academics.currentSemester}</strong></div>
                            <div className="stat-item"><span>CGPA</span><strong>{userData.academics.cgpa.toFixed(2)}</strong></div>
                            <div className="stat-item"><span>Latest SGPA</span><strong>{userData.academics.sgpa.toFixed(2)}</strong></div>
                        </div>
                    </div>
                    <div className="dashboard-card">
                        <h3 className="card-header"><FaProjectDiagram /> My Projects</h3>
                        <div className="project-list">
                            {userData.projects.map(project => (
                                <div key={project._id} className="project-item">
                                    <div className="project-info">
                                        <h4>{project.title} <span className={`status ${project.status.replace(' ', '-').toLowerCase()}`}>{project.status}</span></h4>
                                        <p>{project.description}</p>
                                    </div>
                                    <div className="project-actions">
                                        {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="button-icon"><FaGithub /></a>}
                                        <button className="button-icon" onClick={() => setModal({ type: 'project', data: project })}><FaPencilAlt /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="button-add-new" onClick={() => setModal({ type: 'project', data: null })}><FaPlus /> Add Project</button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    <div className="dashboard-card">
                        <h3 className="card-header"><FaCalendarCheck /> Activity & Achievements</h3>
                        <div className="activity-feed">
                            {userData.activityFeed.map(activity => (
                                <div key={activity._id} className="post-item">
                                    <div className="post-header">
                                        <div className="post-avatar">{userData.firstName.charAt(0)}</div>
                                        <div className="post-user-info">
                                            <strong>{userData.firstName} {userData.lastName}</strong>
                                            <small>{new Date(activity.date).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <div className="post-content">
                                        <p>{activity.content}</p>
                                        {activity.mediaUrl && <img src={activity.mediaUrl} alt="Activity" className="post-media" />}
                                        {activity.link && <a href={activity.link} target="_blank" rel="noopener noreferrer" className="post-link"><FaLink /> {activity.link}</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="button-add-new" onClick={() => setModal({ type: 'share', data: null })}><FaPlus /> Share an Update</button>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}
            {modal.type === 'academics' && (
                <Modal onClose={() => setModal({ type: null, data: null })}>
                    <h2>Edit Academics</h2>
                    {/* Yahan form aayega */}
                    <button onClick={() => handleSave('academics', {})}>Save</button>
                </Modal>
            )}
            {modal.type === 'project' && (
                <Modal onClose={() => setModal({ type: null, data: null })}>
                    <h2>{modal.data ? 'Edit Project' : 'Add New Project'}</h2>
                    {/* Yahan project ka form aayega */}
                    <button onClick={() => handleSave('project', {})}>Save Project</button>
                </Modal>
            )}
            {modal.type === 'share' && (
                <Modal onClose={() => setModal({ type: null, data: null })}>
                    <h2>Share an Update</h2>
                    <div className="share-box-form">
                        <textarea placeholder={`What's on your mind, ${userData.firstName}?`}></textarea>
                        <div className="share-box-actions">
                            <button><FaImage /> Photo</button>
                            <button><FaVideo /> Video</button>
                            <button><FaLink /> Link</button>
                        </div>
                        <button className="button-primary" onClick={() => handleSave('share', {})}>Post</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StudentDashboardPage;