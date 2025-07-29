import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import HeatMap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { FaEdit, FaAward, FaCodeBranch, FaTimes, FaLinkedin, FaGithub } from 'react-icons/fa';
import './StudentPortfolioPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Data and Configuration ---
const platformList = [
    { key: 'leetcode', name: 'LeetCode', icon: '/images/leetcode.png' },
    { key: 'gfg', name: 'GFG', icon: '/images/gfg.png' },
    { key: 'codeforces', name: 'Codeforces', icon: '/images/codeforces.png' },
    { key: 'hackerrank', name: 'HackerRank', icon: '/images/hackerrank.png' },
];

// --- Reusable Modal Component ---
const EditProfileModal = ({ portfolio, onClose, onSave }) => {
    // Make a deep copy to prevent modifying the original state directly
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(portfolio)));
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h3>Edit Your Profile</h3>
                        <button type="button" className="close-btn" onClick={onClose} aria-label="Close"><FaTimes /></button>
                    </div>
                    <div className="modal-body">
                        <h4>About You</h4>
                        <label htmlFor="bio">Bio</label>
                        <textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleChange} placeholder="A short description about yourself..." />

                        <h4>Social Links</h4>
                        <label htmlFor="linkedin">LinkedIn Profile URL</label>
                        <input id="linkedin" type="url" name="linkedin" value={formData.socialLinks?.linkedin || ''} onChange={(e) => handleChange(e, 'socialLinks')} placeholder="https://linkedin.com/in/your-username" />

                        <label htmlFor="github">GitHub Profile URL</label>
                        <input id="github" type="url" name="github" value={formData.socialLinks?.github || ''} onChange={(e) => handleChange(e, 'socialLinks')} placeholder="https://github.com/your-username" />

                        <h4>Coding Platform Usernames</h4>
                        {platformList.map(p => (
                            <div className="form-group" key={p.key}>
                                <label htmlFor={p.key}>{p.name} Username</label>
                                <input id={p.key} type="text" name={p.key} value={formData.codingProfiles?.[p.key] || ''} onChange={(e) => handleChange(e, 'codingProfiles')} placeholder={`Your ${p.name} username`} />
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Portfolio Page Component ---
const StudentPortfolioPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPortfolio = () => {
            setLoading(true);
            setTimeout(() => {
                setPortfolio({
                    bio: "A passionate full-stack developer and competitive programmer.",
                    socialLinks: { linkedin: "https://linkedin.com/in/aman", github: "https://github.com/aman" },
                    codingProfiles: { leetcode: 'aman_bundela', gfg: 'aman_gfg', codeforces: 'aman_cf', hackerrank: 'aman_hr' },
                    stats: {
                        leetcode: { easy: 60, medium: 165, hard: 42, total: 267, badges: ['Python', 'SQL'] },
                        gfg: { easy: 80, medium: 120, hard: 30, total: 230, badges: ['Java', 'Arrays'] },
                        codeforces: { easy: 25, medium: 50, hard: 10, total: 85, badges: ['Div2', 'Specialist'] },
                        hackerrank: { easy: 40, medium: 60, hard: 5, total: 105, badges: ['Problem Solving'] },
                    },
                    streakValues: [ { date: '2025-07-26', count: 3 }, { date: '2025-07-25', count: 2 } ]
                });
                setLoading(false);
            }, 500);
        };
        fetchPortfolio();
    }, []);

    const handleSavePortfolio = async (updatedData) => {
        console.log("Saving data to backend:", updatedData);
        setPortfolio(updatedData);
    };

    if (loading) return <div className="container" style={{textAlign: 'center', padding: '5rem'}}><h2>Loading Portfolio...</h2></div>;
    if (!portfolio) return <div className="container" style={{textAlign: 'center', padding: '5rem'}}><h2>Could not load portfolio.</h2></div>;

    const { stats, streakValues } = portfolio;
    const totalProblems = stats ? Object.values(stats).reduce((acc, p) => acc + p.total, 0) : 0;
    const chartOptions = { cutout: '70%', maintainAspectRatio: true, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }, responsive: false };
    const combinedChartData = { labels: ['Easy', 'Medium', 'Hard'], datasets: [{ data: [stats ? Object.values(stats).reduce((acc, p) => acc + p.easy, 0) : 0, stats ? Object.values(stats).reduce((acc, p) => acc + p.medium, 0) : 0, stats ? Object.values(stats).reduce((acc, p) => acc + p.hard, 0) : 0], backgroundColor: ['#4CAF50', '#FFC107', '#F44336'], borderWidth: 2 }] };
    const getPlatformChartData = (key) => ({ labels: ['Easy', 'Medium', 'Hard'], datasets: [{ data: [stats[key].easy, stats[key].medium, stats[key].hard], backgroundColor: ['#4CAF50', '#FFC107', '#F44336'], borderWidth: 2 }] });

    return (
        <>
            <div className="portfolio-main">
                <div className="profile-left">
                    <div className="profile-card">
                        <div className="avatar-big">{currentUser?.user?.firstName?.charAt(0)}</div>
                        <h2>{currentUser?.user?.firstName} {currentUser?.user?.lastName}</h2>
                        <p>{currentUser?.user?.email}</p>
                        <button className="edit-btn" onClick={() => setIsModalOpen(true)}><FaEdit /> Edit Profile</button>
                        <p className="bio">{portfolio.bio}</p>
                        <div className="social-links">
                            {portfolio.socialLinks?.github && <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer"><FaGithub /></a>}
                            {portfolio.socialLinks?.linkedin && <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>}
                        </div>
                    </div>
                </div>
                <div className="profile-right">
                    <div className="stats-row">
                        <div className="stat-card"><h4><FaAward /> All Platforms</h4><div className="chart-container"><Doughnut data={combinedChartData} width={160} height={160} options={chartOptions} /></div><div className="stat-total"><span>Total Solved</span><h2>{totalProblems}</h2></div></div>
                        {stats && Object.keys(stats).map(key => {
                            const platformInfo = platformList.find(p => p.key === key);
                            return (<div className="stat-card" key={key}><h4><img src={platformInfo.icon} alt={platformInfo.name} className="platform-icon-sm" />{platformInfo.name}</h4><div className="chart-container"><Doughnut data={getPlatformChartData(key)} width={160} height={160} options={chartOptions} /></div><div className="stat-total"><span>Total</span><h2>{stats[key].total}</h2></div></div>);
                        })}
                    </div>
                    <div className="bottom-row">
                        <div className="awards-row">
                            <h4><FaAward /> Badges & Achievements</h4>
                            <div className="badges-list">
                                {stats && Object.entries(stats).flatMap(([platformKey, platformData]) => platformData.badges.map((badge, idx) => (<div className="badge-card" key={`${platformKey}-${idx}`}><img src={platformList.find(p => p.key === platformKey)?.icon} alt={platformKey} className="platform-icon-xs" /><span>{badge}</span></div>)))}
                            </div>
                        </div>
                        <div className="streaks-row">
                            <h4><FaCodeBranch /> Coding Streaks</h4>
                            <HeatMap startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))} endDate={new Date()} values={streakValues || []} squareSize={12} gutterSize={3} classForValue={(v) => !v ? 'color-empty' : `color-github-${Math.min(v.count, 4)}`} showWeekdayLabels={true} />
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && <EditProfileModal portfolio={portfolio} onClose={() => setIsModalOpen(false)} onSave={handleSavePortfolio} />}
        </>
    );
};

export default StudentPortfolioPage;