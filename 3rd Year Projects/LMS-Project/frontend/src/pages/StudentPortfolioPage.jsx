import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import portfolioService from '../services/PortfolioService.js';
import { FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './StudentPortfolioPage.css'; // Hum is CSS file ko bhi update karenge

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Main Component ---
const StudentPortfolioPage = () => {
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    const [portfolio, setPortfolio] = useState(null);
    const [originalPortfolio, setOriginalPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);

    // Data Fetching
    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const response = await portfolioService.getPortfolio(token);
                setPortfolio(response.data);
                setOriginalPortfolio(JSON.parse(JSON.stringify(response.data))); // Deep copy for cancellation
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load portfolio.');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [token]);

    // Edit Mode Toggling
    const handleEdit = () => setEditMode(true);
    const handleCancel = () => {
        setPortfolio(originalPortfolio);
        setEditMode(false);
    };

    // Form Handling
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPortfolio({ ...portfolio, [name]: value });
    };

    const handleNestedChange = (section, name, value) => {
        setPortfolio(prev => ({
            ...prev,
            [section]: { ...prev[section], [name]: value }
        }));
    };

    // Save/Submit Logic
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await portfolioService.updatePortfolio(portfolio, token);
            setPortfolio(response.data);
            setOriginalPortfolio(JSON.parse(JSON.stringify(response.data)));
            setEditMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update portfolio.');
        } finally {
            setLoading(false);
        }
    };

    // --- Chart Data ---
    const problemChartData = {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
            data: [
                portfolio?.problemStats?.easy || 0,
                portfolio?.problemStats?.medium || 0,
                portfolio?.problemStats?.hard || 0
            ],
            backgroundColor: ['#4caf50', '#ffc107', '#f44336'],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };

    // --- Render Logic ---
    if (loading && !portfolio) return <div className="container"><h2>Loading Portfolio...</h2></div>;
    if (error) return <div className="container error-message"><h2>Error</h2><p>{error}</p></div>;

    if (editMode) {
        // --- EDIT MODE JSX ---
        return (
            <div className="container portfolio-edit-container">
                <h2>Edit Your Portfolio</h2>
                {/* Bio and Social Links */}
                <div className="edit-section">
                    <h3>Personal Information</h3>
                    <label>Bio</label>
                    <textarea name="bio" value={portfolio.bio || ''} onChange={handleInputChange} maxLength="250" />
                    <label>LinkedIn Profile URL</label>
                    <input type="text" name="linkedin" value={portfolio.socialLinks?.linkedin || ''} onChange={(e) => handleNestedChange('socialLinks', e.target.name, e.target.value)} />
                    <label>GitHub Profile URL</label>
                    <input type="text" name="github" value={portfolio.socialLinks?.github || ''} onChange={(e) => handleNestedChange('socialLinks', e.target.name, e.target.value)} />
                </div>
                {/* Problem Stats */}
                <div className="edit-section">
                    <h3>Problem Solving Stats</h3>
                    <label>Easy Problems Solved</label>
                    <input type="number" name="easy" value={portfolio.problemStats?.easy || 0} onChange={(e) => handleNestedChange('problemStats', e.target.name, parseInt(e.target.value) || 0)} />
                    <label>Medium Problems Solved</label>
                    <input type="number" name="medium" value={portfolio.problemStats?.medium || 0} onChange={(e) => handleNestedChange('problemStats', e.target.name, parseInt(e.target.value) || 0)} />
                    <label>Hard Problems Solved</label>
                    <input type="number" name="hard" value={portfolio.problemStats?.hard || 0} onChange={(e) => handleNestedChange('problemStats', e.target.name, parseInt(e.target.value) || 0)} />
                </div>
                {/* Add more sections for skills, awards etc. as needed */}
                <div className="edit-actions">
                    <button onClick={handleSubmit} className="button-save" disabled={loading}><FaSave /> {loading ? 'Saving...' : 'Save Changes'}</button>
                    <button onClick={handleCancel} className="button-cancel" disabled={loading}><FaTimes /> Cancel</button>
                </div>
            </div>
        );
    }

    // --- VIEW MODE JSX (THE DASHBOARD) ---
    const totalProblems = (portfolio.problemStats?.easy || 0) + (portfolio.problemStats?.medium || 0) + (portfolio.problemStats?.hard || 0);

    return (
        <div className="portfolio-dashboard">
            <div className="portfolio-grid">
                {/* Left Column: User Info */}
                <div className="portfolio-card user-info-card">
                    <div className="user-avatar">{currentUser.user.firstName.charAt(0)}</div>
                    <h2>{currentUser.user.firstName} {currentUser.user.lastName}</h2>
                    <p className="user-email">{currentUser.user.email}</p>
                    <button className="edit-profile-btn" onClick={handleEdit}><FaEdit /> Edit Profile</button>
                    <p className="user-bio">{portfolio.bio}</p>
                    <div className="social-links">
                        {portfolio.socialLinks?.github && <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer"><FaGithub /></a>}
                        {portfolio.socialLinks?.linkedin && <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>}
                        {portfolio.socialLinks?.twitter && <a href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>}
                        {portfolio.socialLinks?.website && <a href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer"><FaGlobe /></a>}
                    </div>
                </div>

                {/* Right Area: Stats and Charts */}
                <div className="portfolio-card problems-solved-card">
                    <h3>Problems Solved</h3>
                    <div className="chart-container">
                        <Doughnut data={problemChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        <div className="chart-total">
                            <span>Total</span>
                            <strong>{totalProblems}</strong>
                        </div>
                    </div>
                </div>

                <div className="portfolio-card skills-card">
                    <h3>Top Skills</h3>
                    <div className="skills-list">
                        {portfolio.skills && portfolio.skills.length > 0 ? (
                            portfolio.skills.slice(0, 10).map((skill, index) => <span key={index} className="skill-tag">{skill}</span>)
                        ) : (
                            <p>No skills added yet.</p>
                        )}
                    </div>
                </div>

                {/* Aap yahan aur bhi card add kar sakte hain (Awards, Coding Profiles etc.) */}
            </div>
        </div>
    );
};

export default StudentPortfolioPage;