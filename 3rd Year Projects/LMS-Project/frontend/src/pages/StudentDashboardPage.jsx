import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaBook, FaCalendarCheck, FaPlus, FaProjectDiagram, FaPencilAlt, FaGithub, FaImage, FaVideo, FaLink, FaTimes } from 'react-icons/fa';
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

// --- Academic Edit Form Component (UPDATED) ---
const AcademicEditForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        // --- UPDATE: Form ke aaspas ek wrapper div add kiya gaya hai ---
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="edit-form">
                <h2>Edit Academics</h2>
                <div className="form-group">
                    <label htmlFor="currentSemester">Current Semester</label>
                    <input type="number" min="1" id="currentSemester" name="currentSemester" value={formData.currentSemester} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="cgpa">CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" id="cgpa" name="cgpa" value={formData.cgpa} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="sgpa">Latest SGPA</label>
                    <input type="number" step="0.01" min="0" max="10" id="sgpa" name="sgpa" value={formData.sgpa} onChange={handleChange} />
                </div>
                <div className="form-actions">
                    <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Project Edit Form Component (UPDATED) ---
const ProjectEditForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialData || { title: '', description: '', status: 'In Progress', githubLink: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        // --- UPDATE: Form ke aaspas ek wrapper div add kiya gaya hai ---
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="edit-form">
                <h2>{initialData?._id ? 'Edit Project' : 'Add New Project'}</h2>
                <div className="form-group">
                    <label htmlFor="title">Project Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="githubLink">GitHub Link (Optional)</label>
                    <input type="url" id="githubLink" name="githubLink" value={formData.githubLink} onChange={handleChange} />
                </div>
                <div className="form-actions">
                    <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ... baaki ka StudentDashboardPage component waisa hi rahega ...
const StudentDashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [modal, setModal] = useState({ type: null, data: null });

    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            if (!token) throw new Error('Authentication token not found. Please log in.');

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/users/profile', config);

            setUserData({
                ...data,
                academics: data.academics || { currentSemester: 1, cgpa: 0, sgpa: 0 },
                projects: data.projects || [],
                // Dummy activity feed, backend mein add kiya ja sakta hai
                activityFeed: [
                    { _id: 'a1', type: 'conference', content: 'Attended the National Developer Conference 2025. Learned a lot about WebAssembly!', date: '2025-07-15T10:00:00.000Z', mediaUrl: '/images/conference_pic.jpg', link: 'https://devconf.example.com' },
                ]
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleSave = async (type, data) => {
        setIsSubmitting(true);
        setError('');
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            if (!token) throw new Error('Authentication token not found.');

            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };

            if (type === 'academics') {
                const { data: updatedAcademics } = await axios.put('/api/users/profile/academics', data, config);
                setUserData(prev => ({ ...prev, academics: updatedAcademics }));
            }

            if (type === 'project') {
                if (data._id) { // Edit Project
                    const { data: updatedProject } = await axios.put(`/api/users/profile/projects/${data._id}`, data, config);
                    setUserData(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p._id === updatedProject._id ? updatedProject : p)
                    }));
                } else { // Add Project
                    const { data: newProject } = await axios.post('/api/users/profile/projects', data, config);
                    setUserData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
                }
            }

            closeModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => setModal({ type: null, data: null });

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
                <div className="left-column">
                    <div className="dashboard-card">
                        <h3 className="card-header">
                            <FaBook /> Academic Summary
                            <button className="button-edit-icon" onClick={() => setModal({ type: 'academics', data: userData.academics })}><FaPencilAlt /></button>
                        </h3>
                        <div className="academic-stats">
                            <div className="stat-item"><span>Current Semester</span><strong>{userData.academics.currentSemester}</strong></div>
                            <div className="stat-item"><span>CGPA</span><strong>{parseFloat(userData.academics.cgpa).toFixed(2)}</strong></div>
                            <div className="stat-item"><span>Latest SGPA</span><strong>{parseFloat(userData.academics.sgpa).toFixed(2)}</strong></div>
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
                        <button className="button-add-new" onClick={() => setModal({ type: 'project', data: null })}>
                            <FaPlus /> Add Project
                        </button>
                    </div>
                </div>

                <div className="right-column">
                    <div className="dashboard-card">
                        <h3 className="card-header"><FaCalendarCheck /> Activity & Achievements</h3>
                        <div className="activity-feed">
                            {userData.activityFeed && userData.activityFeed.map(activity => (
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

            {modal.type === 'academics' && (
                <Modal onClose={closeModal}>
                    <AcademicEditForm
                        initialData={modal.data}
                        onSave={(data) => handleSave('academics', data)}
                        onCancel={closeModal}
                        isSubmitting={isSubmitting}
                    />
                </Modal>
            )}
            {modal.type === 'project' && (
                <Modal onClose={closeModal}>
                    <ProjectEditForm
                        initialData={modal.data}
                        onSave={(data) => handleSave('project', data)}
                        onCancel={closeModal}
                        isSubmitting={isSubmitting}
                    />
                </Modal>
            )}
            {modal.type === 'share' && (
                <Modal onClose={closeModal}>
                    <h2>Share an Update</h2>
                    <p>This feature is coming soon!</p>
                </Modal>
            )}
        </div>
    );
};

export default StudentDashboardPage;