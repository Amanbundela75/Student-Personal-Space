import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    FaBook, FaCalendarCheck, FaPlus, FaProjectDiagram, FaPencilAlt, FaGithub, FaTrash, FaTimes,
    FaCertificate, FaFilePdf, FaFilter, FaSearch, FaSun, FaMoon, FaLayerGroup, FaBolt, FaUserEdit
} from 'react-icons/fa';
import './StudentDashboardPage.css';
import AchievementForm from '../components/AchievementForm';
import CertificationForm from '../components/CertificationForm';

// ---- OPTIONAL ANIMATION (FRAMER MOTION FALLBACK) ----
let motion;
try {
    // eslint-disable-next-line global-require
    motion = require('framer-motion').motion;
} catch (_) {
    motion = { div: (props) => <div {...props} /> }; // fallback if framer-motion not installed
}
const MotionDiv = motion.div;

// --- API Configuration ---
const API_URL = 'http://localhost:5001';
const api = axios.create({ baseURL: API_URL });

// ---------- Utility Hooks ----------
const useLocalStorage = (key, initial) => {
    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }, [value, key]);
    return [value, setValue];
};

const useIntersectionFade = (options = {}) => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        setShow(true);
                        obs.unobserve(el);
                    }
                });
            }, { threshold: 0.15, ...options }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [options]);
    return { ref, show };
};

// --- Toast Notification System (Lightweight) ---
const ToastContext = React.createContext();
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const push = (type, message, timeout = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, type, message }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), timeout);
    };
    return (
        <ToastContext.Provider value={{ push }}>
            {children}
            <div className="toast-stack">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
const useToast = () => React.useContext(ToastContext);

// --- Reusable Modal Component ---
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog"><FaTimes /></button>
            {children}
        </div>
    </div>
);

// --- Form Components ---
const AcademicEditForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialData || {});
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="edit-form">
                <h2>Edit Academics</h2>
                <div className="form-group">
                    <label htmlFor="currentSemester">Current Semester</label>
                    <input type="number" min="1" id="currentSemester" name="currentSemester"
                           value={formData.currentSemester || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="cgpa">CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" id="cgpa" name="cgpa"
                           value={formData.cgpa || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="sgpa">Latest SGPA</label>
                    <input type="number" step="0.01" min="0" max="10" id="sgpa" name="sgpa"
                           value={formData.sgpa || ''} onChange={handleChange} />
                </div>
                <div className="form-actions dual">
                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

const ProjectEditForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialData || { title: '', description: '', status: 'In Progress', githubLink: '' });
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="edit-form">
                <h2>{initialData?._id ? 'Edit Project' : 'Add Project'}</h2>
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
                <div className="form-actions dual">
                    <button type="submit" className="button-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Project'}</button>
                    <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

// --- Bio Edit Form Enhanced ---
const BioEditForm = ({ initialBio, onSave, onCancel, isSubmitting }) => {
    const [bio, setBio] = useState(initialBio || '');
    const maxLen = 250;
    const remaining = maxLen - bio.length;
    const handleSubmit = (e) => { e.preventDefault(); onSave(bio); };
    return (
        <form onSubmit={handleSubmit} className="bio-edit-form">
      <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a bit about yourself..."
          maxLength={maxLen}
          rows={3}
          autoFocus
      />
            <div className="bio-meta">
                <span className={`chars-left ${remaining < 30 ? 'warn' : ''}`}>{remaining} left</span>
            </div>
            <div className="bio-form-actions">
                <button type="submit" className="button-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
                <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
            </div>
        </form>
    );
};

const isImage = (fileName) => !!fileName && /\.(jpeg|jpg|png|gif|webp)$/i.test(fileName);

// Animated circular progress for CGPA / SGPA
const CircularStat = ({ label, value = 0, max = 10, color = '#007bff' }) => {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="circular-stat">
            <svg viewBox="0 0 36 36">
                <path
                    className="bg"
                    d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="2.5"
                />
                <path
                    className="progress"
                    stroke={color}
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    strokeDasharray={`${pct}, 100`}
                    d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                />
                <text x="18" y="20.35" className="circular-value">{value?.toFixed ? value.toFixed(2) : value}</text>
            </svg>
            <span className="circular-label">{label}</span>
        </div>
    );
};

// Floating Action Button
const FloatingActionMenu = ({ onAddProject, onAddAchievement, onAddCert }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`fab-wrapper ${open ? 'open' : ''}`}>
            <button className="fab-main" onClick={() => setOpen(o => !o)} aria-label="Toggle quick actions">
                <FaPlus />
            </button>
            <div className="fab-actions">
                <button onClick={onAddProject} aria-label="Add Project"><FaProjectDiagram /></button>
                <button onClick={onAddAchievement} aria-label="Add Achievement"><FaCalendarCheck /></button>
                <button onClick={onAddCert} aria-label="Add Certification"><FaCertificate /></button>
            </div>
        </div>
    );
};

const StudentDashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ type: null, data: null });
    const [isEditingBio, setIsEditingBio] = useState(false);

    // NEW state additions
    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');
    const [achSortDesc, setAchSortDesc] = useState(true);
    const [darkMode, setDarkMode] = useLocalStorage('dashboard_darkMode', false);

    const toast = useToast();

    const profilePicInputRef = useRef(null);

    const refreshData = useCallback(async () => {
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const token = lmsUser?.token;
            if (!token) throw new Error('Authentication token not found.');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [profileResponse, achievementsResponse, certificationsResponse] = await Promise.all([
                api.get('/api/users/profile', config),
                api.get('/api/achievements', config),
                api.get('/api/users/profile/certifications', config)
            ]);
            const profileData = profileResponse.data;
            if (profileData.profilePicture) profileData.profilePicture = `${API_URL}${profileData.profilePicture}`;
            setUserData(profileData);
            setAchievements(achievementsResponse.data);
            setCertifications(certificationsResponse.data);
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

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [darkMode]);

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
            toast.push('success', 'Profile picture updated');
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveBio = async (newBio) => {
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { Authorization: `Bearer ${lmsUser?.token}` } };
            await api.put('/api/users/profile/bio', { bio: newBio }, config);
            setUserData(prev => ({ ...prev, bio: newBio }));
            setIsEditingBio(false);
            toast.push('success', 'Bio updated');
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async (type, data) => {
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { Authorization: `Bearer ${lmsUser?.token}` } };
            let updatedUserData = { ...userData };
            if (type === 'academics') {
                const response = await api.put('/api/users/profile/academics', data, config);
                updatedUserData.academics = response.data.academics;
            } else if (type === 'project') {
                if (modal.data?._id) {
                    const response = await api.put(`/api/users/profile/projects/${modal.data._id}`, data, config);
                    updatedUserData.projects = userData.projects.map(p => p._id === modal.data._id ? response.data : p);
                } else {
                    const response = await api.post('/api/users/profile/projects', data, config);
                    updatedUserData.projects = [...(updatedUserData.projects || []), response.data];
                }
            }
            setUserData(updatedUserData);
            toast.push('success', 'Changes saved');
            closeModal();
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveAchievement = async (formData, achievementId) => {
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${lmsUser?.token}` } };
            if (achievementId) {
                await api.put(`/api/achievements/${achievementId}`, formData, config);
            } else {
                await api.post('/api/achievements', formData, config);
            }
            toast.push('success', 'Achievement saved');
            closeModal();
            refreshData();
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveCertification = async (formData) => {
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${lmsUser?.token}` } };
            await api.post('/api/users/profile/certifications', formData, config);
            toast.push('success', 'Certification saved');
            closeModal();
            refreshData();
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Delete this project?')) return;
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { Authorization: `Bearer ${lmsUser?.token}` } };
            await api.delete(`/api/users/profile/projects/${projectId}`, config);
            setUserData(prev => ({ ...prev, projects: prev.projects.filter(p => p._id !== projectId) }));
            toast.push('success', 'Project deleted');
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAchievement = async (achievementId) => {
        if (!window.confirm('Delete this achievement?')) return;
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { Authorization: `Bearer ${lmsUser?.token}` } };
            await api.delete(`/api/achievements/${achievementId}`, config);
            setAchievements(prev => prev.filter(a => a._id !== achievementId));
            toast.push('success', 'Achievement deleted');
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCertification = async (certId) => {
        if (!window.confirm('Delete this certification?')) return;
        setIsSubmitting(true);
        try {
            const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
            const config = { headers: { Authorization: `Bearer ${lmsUser?.token}` } };
            await api.delete(`/api/users/profile/certifications/${certId}`, config);
            setCertifications(prev => prev.filter(c => c._id !== certId));
            toast.push('success', 'Certification deleted');
        } catch (err) {
            toast.push('error', err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => setModal({ type: null, data: null });

    const filteredProjects = useMemo(() => {
        if (!userData?.projects) return [];
        return userData.projects.filter(p => {
            const statusMatch = projectStatusFilter === 'ALL' || p.status === projectStatusFilter;
            const textMatch = p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                p.description.toLowerCase().includes(projectSearch.toLowerCase());
            return statusMatch && textMatch;
        });
    }, [userData, projectSearch, projectStatusFilter]);

    const sortedAchievements = useMemo(() => {
        const arr = [...achievements];
        arr.sort((a, b) => {
            const da = new Date(a.createdAt || a.date || 0).getTime();
            const db = new Date(b.createdAt || b.date || 0).getTime();
            return achSortDesc ? db - da : da - db;
        });
        return arr;
    }, [achievements, achSortDesc]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="skeleton-header shimmer" />
                <div className="skeleton-row">
                    <div className="skeleton-card shimmer" />
                    <div className="skeleton-card shimmer" />
                </div>
                <div className="skeleton-wide shimmer" />
                <div className="skeleton-wide shimmer" />
            </div>
        );
    }
    if (error) return <div className="container" style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;
    if (!userData) return <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>No user data available.</div>;

    return (
        <div className="dashboard-root">
            <div className="parallax-bg" />
            <header className="dashboard-header-new floating-card">
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
                    <div className="top-bar-line">
                        <h1>Welcome back, {userData.firstName}!</h1>
                        <div className="theme-toggle-wrapper">
                            <button
                                className="button-icon theme-toggle"
                                onClick={() => setDarkMode(d => !d)}
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>
                    </div>
                    <div className="bio-section">
                        {isEditingBio ? (
                            <BioEditForm
                                initialBio={userData.bio}
                                onSave={handleSaveBio}
                                onCancel={() => setIsEditingBio(false)}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <>
                                <p className="bio-text">
                                    {userData.bio || "Here's your professional and academic snapshot."}
                                </p>
                                <button
                                    className="button-icon bio-edit-btn"
                                    onClick={() => setIsEditingBio(true)}
                                    disabled={isSubmitting}
                                    aria-label="Edit bio"
                                >
                                    <FaUserEdit />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="dashboard-main-content">
                {/* Stats + Projects Row */}
                <div className="dashboard-row">
                    <MotionDiv
                        className="dashboard-col"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                    >
                        <div className="card floating-card">
                            <div className="card-header">
                                <h3><FaBook /> Academic Summary</h3>
                                <button
                                    className="button-icon"
                                    onClick={() => setModal({ type: 'academics', data: userData.academics })}
                                    disabled={isSubmitting}
                                    aria-label="Edit academics"
                                >
                                    <FaPencilAlt />
                                </button>
                            </div>
                            <div className="card-content stats-flex">
                                <div className="stat-block glass">
                                    <CircularStat label="CGPA" value={userData.academics?.cgpa || 0} color="#4e9bff" />
                                </div>
                                <div className="stat-block glass">
                                    <CircularStat label="Latest SGPA" value={userData.academics?.sgpa || 0} color="#ffb347" />
                                </div>
                                <div className="stat-box glass fade-in-up">
                                    <h4>Semester</h4>
                                    <p>{userData.academics?.currentSemester || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        className="dashboard-col"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.05 }}
                    >
                        <div className="card floating-card">
                            <div className="card-header with-filters">
                                <h3><FaProjectDiagram /> Projects</h3>
                                <div className="inline-filters">
                                    <div className="search-box">
                                        <FaSearch />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={projectSearch}
                                            onChange={(e) => setProjectSearch(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={projectStatusFilter}
                                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                                        aria-label="Filter status"
                                    >
                                        <option value="ALL">All</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                    <button
                                        className="button-icon"
                                        onClick={() => setModal({ type: 'project', data: null })}
                                        disabled={isSubmitting}
                                        aria-label="Add project"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                            <div className="card-content project-content-scroll">
                                {filteredProjects?.length > 0 ? (
                                    <ul className="project-list">
                                        {filteredProjects.map(project => (
                                            <li key={project._id} className="project-item hover-lift">
                                                <div className="project-info">
                                                    <h4>
                                                        {project.title}{' '}
                                                        <span className={`status-badge status-${project.status?.toLowerCase().replace(' ', '-')}`}>
                                {project.status}
                              </span>
                                                    </h4>
                                                    <p>{project.description}</p>
                                                </div>
                                                <div className="project-actions">
                                                    {project.githubLink && (
                                                        <a
                                                            href={project.githubLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="button-icon"
                                                            aria-label="Open GitHub repo"
                                                        >
                                                            <FaGithub />
                                                        </a>
                                                    )}
                                                    <button
                                                        className="button-icon"
                                                        onClick={() => setModal({ type: 'project', data: project })}
                                                        disabled={isSubmitting}
                                                        aria-label="Edit project"
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                    <button
                                                        className="button-icon danger"
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        disabled={isSubmitting}
                                                        aria-label="Delete project"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="empty-state">No projects match filters. Add or adjust filters.</p>
                                )}
                            </div>
                        </div>
                    </MotionDiv>
                </div>

                {/* Achievements */}
                <MotionDiv
                    className="card floating-card"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                >
                    <div className="card-header">
                        <h3><FaCalendarCheck /> Activity & Achievements</h3>
                        <div className="action-group">
                            <button
                                className="button-icon"
                                onClick={() => setAchSortDesc(d => !d)}
                                aria-label="Toggle sort order"
                                title="Toggle sort order"
                            >
                                <FaFilter />
                            </button>
                            <button
                                className="button-icon"
                                onClick={() => setModal({ type: 'achievement', data: null })}
                                disabled={isSubmitting}
                                aria-label="Add achievement"
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                    <div className="card-content horizontal-scroll-container snap-x">
                        {sortedAchievements.length > 0 ? (
                            <ul className="achievement-list-horizontal">
                                {sortedAchievements.map(achievement => (
                                    <li key={achievement._id} className="achievement-item-horizontal hover-float snap-start">
                                        {achievement.mediaUrl && (
                                            achievement.mediaType === 'image'
                                                ? <img src={`${API_URL}${achievement.mediaUrl}`} alt={achievement.description} className="achievement-media" />
                                                : <video src={`${API_URL}${achievement.mediaUrl}`} controls className="achievement-media" />
                                        )}
                                        <div className="achievement-info">
                                            <p>{achievement.description}</p>
                                            <div className="achievement-actions">
                                                <button
                                                    className="button-icon"
                                                    onClick={() => setModal({ type: 'achievement', data: achievement })}
                                                    disabled={isSubmitting}
                                                    aria-label="Edit achievement"
                                                >
                                                    <FaPencilAlt />
                                                </button>
                                                <button
                                                    className="button-icon danger"
                                                    onClick={() => handleDeleteAchievement(achievement._id)}
                                                    disabled={isSubmitting}
                                                    aria-label="Delete achievement"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (<p className="empty-state">No achievements yet. Click + to add one!</p>)}
                    </div>
                </MotionDiv>

                {/* Certifications */}
                <MotionDiv
                    className="card floating-card"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.05 }}
                >
                    <div className="card-header">
                        <h3><FaCertificate /> Certifications</h3>
                        <button
                            className="button-icon"
                            onClick={() => setModal({ type: 'certification', data: null })}
                            disabled={isSubmitting}
                            aria-label="Add certification"
                        >
                            <FaPlus />
                        </button>
                    </div>
                    <div className="card-content horizontal-scroll-container snap-x">
                        {certifications && certifications.length > 0 ? (
                            <ul className="achievement-list-horizontal">
                                {certifications.map(cert => (
                                    <li key={cert._id} className="achievement-item-horizontal hover-float snap-start">
                                        {isImage(cert.fileUrl) ? (
                                            <a href={`${API_URL}${cert.fileUrl}`} target="_blank" rel="noopener noreferrer" title="View full image">
                                                <img src={`${API_URL}${cert.fileUrl}`} alt={cert.title} className="achievement-media" />
                                            </a>
                                        ) : (
                                            <div className="pdf-placeholder">
                                                <FaFilePdf size={60} />
                                                <a
                                                    href={`${API_URL}${cert.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="button-primary view-pdf-btn"
                                                >
                                                    View PDF
                                                </a>
                                            </div>
                                        )}
                                        <div className="achievement-info">
                                            <h4>{cert.title}</h4>
                                            <p>Issued by: {cert.issuer}</p>
                                            <div className="achievement-actions">
                                                <button
                                                    className="button-icon danger"
                                                    onClick={() => handleDeleteCertification(cert._id)}
                                                    disabled={isSubmitting}
                                                    title="Delete Certificate"
                                                    aria-label="Delete certificate"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No certifications yet. Click + to add one!</p>
                        )}
                    </div>
                </MotionDiv>
            </main>

            {/* Floating Action Menu */}
            <FloatingActionMenu
                onAddProject={() => setModal({ type: 'project', data: null })}
                onAddAchievement={() => setModal({ type: 'achievement', data: null })}
                onAddCert={() => setModal({ type: 'certification', data: null })}
            />

            {/* --- Modal --- */}
            {modal.type && (
                <Modal onClose={closeModal}>
                    {modal.type === 'academics' && (
                        <AcademicEditForm
                            initialData={modal.data}
                            onSave={(data) => handleSave('academics', data)}
                            onCancel={closeModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {modal.type === 'project' && (
                        <ProjectEditForm
                            initialData={modal.data}
                            onSave={(data) => handleSave('project', data)}
                            onCancel={closeModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {modal.type === 'achievement' && (
                        <AchievementForm
                            initialData={modal.data}
                            onSave={handleSaveAchievement}
                            onCancel={closeModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {modal.type === 'certification' && (
                        <CertificationForm
                            initialData={modal.data}
                            onSave={handleSaveCertification}
                            onCancel={closeModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
};

// Wrap with ToastProvider
const DashboardWithProviders = () => (
    <ToastProvider>
        <StudentDashboardPage />
    </ToastProvider>
);

export default DashboardWithProviders;