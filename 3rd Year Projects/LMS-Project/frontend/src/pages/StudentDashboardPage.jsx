import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FaBook, FaCalendarCheck, FaPlus, FaProjectDiagram, FaPencilAlt, FaGithub, FaImage, FaTrash, FaTimes } from 'react-icons/fa';
import './StudentDashboardPage.css';
import AchievementForm from '../components/AchievementForm';

// --- API Configuration ---
const API_URL = 'http://localhost:5001';
const api = axios.create({ baseURL: API_URL });

// --- Reusable Modal Component ---
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
            {children}
        </div>
    </div>
);

// --- Form Components (Inki body ko chhota rakha gaya hai, code wahi hai) ---
const AcademicEditForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialData || {});
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (<div className="form-wrapper"><form onSubmit={handleSubmit} className="edit-form"><h2>Edit Academics</h2><div className="form-group"><label htmlFor="currentSemester">Current Semester</label><input type="number" min="1" id="currentSemester" name="currentSemester" value={formData.currentSemester || ''} onChange={handleChange} /></div><div className="form-group"><label htmlFor="cgpa">CGPA</label><input type="number" step="0.01" min="0" max="10" id="cgpa" name="cgpa" value={formData.cgpa || ''} onChange={handleChange} /></div><div className="form-group"><label htmlFor="sgpa">Latest SGPA</label><input type="number" step="0.01" min="0" max="10" id="sgpa" name="sgpa" value={formData.sgpa || ''} onChange={handleChange} /></div><div className="form-actions" style={{ display: 'flex', gap: '10px' }}><button type="submit" className="button-primary" disabled={isSubmitting} style={{ flex: 1 }}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button><button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting} style={{ flex: 1 }}>Cancel</button></div></form></div>);
};
const ProjectEditForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialData || { title: '', description: '', status: 'In Progress', githubLink: '' });
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (<div className="form-wrapper"><form onSubmit={handleSubmit} className="edit-form"><h2>{initialData?._id ? 'Edit Project' : 'Add New Project'}</h2><div className="form-group"><label htmlFor="title">Project Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required /></div><div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} required /></div><div className="form-group"><label htmlFor="status">Status</label><select id="status" name="status" value={formData.status} onChange={handleChange}><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="On Hold">On Hold</option></select></div><div className="form-group"><label htmlFor="githubLink">GitHub Link (Optional)</label><input type="url" id="githubLink" name="githubLink" value={formData.githubLink} onChange={handleChange} /></div><div className="form-actions" style={{ display: 'flex', gap: '10px' }}><button type="submit" className="button-primary" disabled={isSubmitting} style={{ flex: 1 }}>{isSubmitting ? 'Saving...' : 'Save Project'}</button><button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting} style={{ flex: 1 }}>Cancel</button></div></form></div>);
};


const StudentDashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ type: null, data: null });
    const profilePicInputRef = useRef(null);

    // Data fetch karne wala function
    const refreshData = useCallback(async () => {
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            if (!token) throw new Error('Authentication token not found.');

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [profileResponse, achievementsResponse] = await Promise.all([
                api.get('/api/users/profile', config),
                api.get('/api/achievements', config)
            ]);

            const profileData = profileResponse.data;
            if (profileData.profilePicture) {
                profileData.profilePicture = `${API_URL}${profileData.profilePicture}`;
            }
            setUserData(profileData);
            setAchievements(achievementsResponse.data);
            setError('');
        } catch (err) {
            console.error("Failed to refresh data", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data.');
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        refreshData().finally(() => setLoading(false));
    }, [refreshData]);

    // Profile picture upload karne wala function
    const handleProfilePicUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profilePicture', file);
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${lmsUser?.token}` } };
            const { data } = await api.put('/api/users/profile/background', formData, config);
            const fullImageUrl = `${API_URL}${data.profilePicture}`;
            setUserData(prev => ({ ...prev, profilePicture: fullImageUrl }));
        } catch (err) {
            alert(`Error uploading image: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UPDATE: Academics aur Projects ko save karne wala function ---
    const handleSave = async (type, data) => {
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            if (!token) throw new Error('Authentication token not found.');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let updatedUserData = { ...userData };

            if (type === 'academics') {
                const response = await api.put('/api/users/profile/academics', data, config);
                updatedUserData.academics = response.data.academics;
            } else if (type === 'project') {
                if (modal.data?._id) { // Project update ho raha hai
                    const response = await api.put(`/api/users/profile/projects/${modal.data._id}`, data, config);
                    updatedUserData.projects = userData.projects.map(p => p._id === modal.data._id ? response.data : p);
                } else { // Naya project add ho raha hai
                    const response = await api.post('/api/users/profile/projects', data, config);
                    updatedUserData.projects.push(response.data);
                }
            }

            setUserData(updatedUserData);
            alert('Changes saved successfully!');
            closeModal();

        } catch (err) {
            alert(`Error saving changes: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UPDATE: Achievements ko save karne wala function ---
    const handleSaveAchievement = async (formData, achievementId) => {
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

            if (achievementId) { // Achievement update ho raha hai
                await api.put(`/api/achievements/${achievementId}`, formData, config);
            } else { // Naya achievement add ho raha hai
                await api.post('/api/achievements', formData, config);
            }

            alert('Achievement saved successfully!');
            closeModal();
            refreshData(); // Data ko refresh karein taaki nayi entry dikhe

        } catch (err) {
            alert(`Error saving achievement: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Project delete karne wala function
    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setIsSubmitting(true);
            try {
                const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
                const token = lmsUser?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await api.delete(`/api/users/profile/projects/${projectId}`, config);
                setUserData(prev => ({
                    ...prev,
                    projects: prev.projects.filter(p => p._id !== projectId)
                }));
                alert('Project deleted successfully.');
            } catch (err) {
                alert(`Error deleting project: ${err.response?.data?.message || err.message}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Achievement delete karne wala function
    const handleDeleteAchievement = async (achievementId) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
            setIsSubmitting(true);
            try {
                const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
                const token = lmsUser?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await api.delete(`/api/achievements/${achievementId}`, config);
                setAchievements(prev => prev.filter(a => a._id !== achievementId));
                alert('Achievement deleted successfully.');
            } catch (err) {
                alert(`Error deleting achievement: ${err.response?.data?.message || err.message}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const closeModal = () => setModal({ type: null, data: null });

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>Loading Dashboard...</div>;
    if (error) return <div className="container" style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;
    if (!userData) return <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>No user data available.</div>;

    return (
        <div className="dashboard-container">
            {/* --- Dashboard Header --- */}
            <header className="dashboard-header-new">
                <div className="profile-picture-container">
                    <img
                        src={userData.profilePicture || 'https://i.ibb.co/6yT4R0N/default-avatar.png'}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <button
                        className="button-change-pic"
                        onClick={() => profilePicInputRef.current.click()}
                        disabled={isSubmitting}
                        title="Change profile picture"
                    >
                        <FaPencilAlt />
                    </button>
                    <input
                        type="file"
                        ref={profilePicInputRef}
                        onChange={handleProfilePicUpload}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>
                <div className="header-content-new">
                    <h1>Welcome back, {userData.firstName}!</h1>
                    <p>Here's your professional and academic snapshot.</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* --- Academic Summary Card --- */}
                <div className="card">
                    <div className="card-header">
                        <h3><FaBook /> Academic Summary</h3>
                        <button className="button-icon" onClick={() => setModal({ type: 'academics', data: userData.academics })} disabled={isSubmitting}><FaPencilAlt /></button>
                    </div>
                    <div className="card-content stats-grid">
                        <div className="stat-box"><h4>Current Semester</h4><p>{userData.academics?.currentSemester || 'N/A'}</p></div>
                        <div className="stat-box"><h4>CGPA</h4><p>{userData.academics?.cgpa?.toFixed(2) || 'N/A'}</p></div>
                        <div className="stat-box"><h4>Latest SGPA</h4><p>{userData.academics?.sgpa?.toFixed(2) || 'N/A'}</p></div>
                    </div>
                </div>

                {/* --- Projects Card --- */}
                <div className="card">
                    <div className="card-header">
                        <h3><FaProjectDiagram /> Projects</h3>
                        <button className="button-icon" onClick={() => setModal({ type: 'project', data: null })} disabled={isSubmitting}><FaPlus /></button>
                    </div>
                    <div className="card-content">
                        {userData.projects && userData.projects.length > 0 ? (
                            <ul className="project-list">{userData.projects.map(project => (
                                <li key={project._id} className="project-item">
                                    <div className="project-info"><h4>{project.title} <span className={`status-badge status-${project.status?.toLowerCase().replace(' ', '-')}`}>{project.status}</span></h4><p>{project.description}</p></div>
                                    <div className="project-actions">
                                        {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="button-icon"><FaGithub /></a>}
                                        <button className="button-icon" onClick={() => setModal({ type: 'project', data: project })} disabled={isSubmitting}><FaPencilAlt /></button>
                                        <button className="button-icon danger" onClick={() => handleDeleteProject(project._id)} disabled={isSubmitting}><FaTrash /></button>
                                    </div>
                                </li>))}
                            </ul>
                        ) : (<p className="empty-state">No projects added yet. Click the '+' icon to add your first project!</p>)}
                    </div>
                </div>

                {/* --- Achievements Card --- */}
                <div className="card">
                    <div className="card-header">
                        <h3><FaCalendarCheck /> Activity & Achievements</h3>
                        <button className="button-icon" onClick={() => setModal({ type: 'achievement', data: null })} disabled={isSubmitting}><FaPlus /></button>
                    </div>
                    <div className="card-content">
                        {achievements.length > 0 ? (
                            <ul className="achievement-list">
                                {achievements.map(achievement => (
                                    <li key={achievement._id} className="achievement-item">
                                        <p>{achievement.description}</p>
                                        {achievement.mediaUrl && (achievement.mediaType === 'image' ?
                                                <img src={`${API_URL}${achievement.mediaUrl}`} alt="Achievement" /> :
                                                <video src={`${API_URL}${achievement.mediaUrl}`} controls />
                                        )}
                                        <div className="achievement-actions">
                                            <button className="button-icon" onClick={() => setModal({ type: 'achievement', data: achievement })} disabled={isSubmitting}><FaPencilAlt /></button>
                                            <button className="button-icon danger" onClick={() => handleDeleteAchievement(achievement._id)} disabled={isSubmitting}><FaTrash /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : ( <p className="empty-state">No achievements posted yet. Click the '+' icon to add your first one!</p> )}
                    </div>
                </div>
            </div>

            {/* --- Modal --- */}
            {modal.type && (
                <Modal onClose={closeModal}>
                    {modal.type === 'academics' && <AcademicEditForm initialData={modal.data} onSave={(data) => handleSave('academics', data)} onCancel={closeModal} isSubmitting={isSubmitting} />}
                    {modal.type === 'project' && <ProjectEditForm initialData={modal.data} onSave={(data) => handleSave('project', data)} onCancel={closeModal} isSubmitting={isSubmitting} />}
                    {modal.type === 'achievement' && <AchievementForm initialData={modal.data} onSave={handleSaveAchievement} onCancel={closeModal} isSubmitting={isSubmitting} />}
                </Modal>
            )}
        </div>
    );
};

export default StudentDashboardPage;