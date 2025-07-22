import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import portfolioService from '../services/PortfolioService.js';
import './StudentPortfolioPage.css'; // Hum iske liye CSS bhi banayenge

const StudentPortfolioPage = () => {
    const { currentUser } = useContext(AuthContext);
    const token = currentUser?.token;

    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const response = await portfolioService.getPortfolio(token);
                setPortfolio(response.data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load portfolio.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [token]);

    const handleInputChange = (section, index, event) => {
        const { name, value } = event.target;
        const updatedSection = [...portfolio[section]];
        updatedSection[index] = { ...updatedSection[index], [name]: value };
        setPortfolio({ ...portfolio, [section]: updatedSection });
    };

    const handleAddItem = (section, newItem) => {
        const updatedSection = [...portfolio[section], newItem];
        setPortfolio({ ...portfolio, [section]: updatedSection });
    };

    const handleRemoveItem = (section, index) => {
        const updatedSection = portfolio[section].filter((_, i) => i !== index);
        setPortfolio({ ...portfolio, [section]: updatedSection });
    };

    const handleSkillsChange = (newSkills) => {
        // Assuming skills are stored as a comma-separated string in the input
        setPortfolio({ ...portfolio, skills: newSkills.split(',').map(skill => skill.trim()) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            // Sirf zaroori data bhejein
            const { skills, events, conferences, codingProfiles } = portfolio;
            const response = await portfolioService.updatePortfolio({ skills, events, conferences, codingProfiles }, token);
            setPortfolio(response.data);
            setSuccess('Portfolio updated successfully!');
            setTimeout(() => setSuccess(''), 3000); // 3 second baad message hata dein
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update portfolio.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !portfolio) return <div className="container"><h2>Loading Portfolio...</h2></div>;
    if (error) return <div className="container error-message"><h2>Error</h2><p>{error}</p></div>;

    return (
        <div className="container portfolio-container">
            <h1 className="portfolio-header">My Professional Portfolio</h1>
            <p className="portfolio-subheader">Showcase your skills, achievements, and coding journey.</p>

            <form onSubmit={handleSubmit}>
                {/* Skills Section */}
                <div className="portfolio-section">
                    <h3>Technical Skills</h3>
                    <p>Enter your skills separated by commas (e.g., React, Node.js, MongoDB)</p>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., JavaScript, Python, Figma"
                        value={portfolio?.skills.join(', ') || ''}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                    />
                </div>

                {/* Coding Profiles Section */}
                <div className="portfolio-section">
                    <h3>Coding Profiles</h3>
                    {portfolio?.codingProfiles.map((profile, index) => (
                        <div key={index} className="portfolio-item">
                            <select name="platform" value={profile.platform} onChange={(e) => handleInputChange('codingProfiles', index, e)}>
                                <option value="LeetCode">LeetCode</option>
                                <option value="HackerRank">HackerRank</option>
                                <option value="Codeforces">Codeforces</option>
                                <option value="CodeChef">CodeChef</option>
                                <option value="Other">Other</option>
                            </select>
                            <input type="text" name="profileUrl" placeholder="Profile URL" value={profile.profileUrl} onChange={(e) => handleInputChange('codingProfiles', index, e)} />
                            <button type="button" onClick={() => handleRemoveItem('codingProfiles', index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={() => handleAddItem('codingProfiles', { platform: 'LeetCode', profileUrl: '' })}>+ Add Profile</button>
                </div>

                {/* Events Section */}
                <div className="portfolio-section">
                    <h3>Events & Activities</h3>
                    {portfolio?.events.map((event, index) => (
                        <div key={index} className="portfolio-item">
                            <input type="text" name="name" placeholder="Event Name (e.g., Hackathon)" value={event.name} onChange={(e) => handleInputChange('events', index, e)} />
                            <input type="text" name="role" placeholder="Your Role (e.g., Winner)" value={event.role} onChange={(e) => handleInputChange('events', index, e)} />
                            <input type="date" name="date" value={event.date ? new Date(event.date).toISOString().split('T')[0] : ''} onChange={(e) => handleInputChange('events', index, e)} />
                            <button type="button" onClick={() => handleRemoveItem('events', index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={() => handleAddItem('events', { name: '', role: '', date: '' })}>+ Add Event</button>
                </div>

                {/* Conferences Section */}
                <div className="portfolio-section">
                    <h3>Conferences & Workshops</h3>
                    {portfolio?.conferences.map((conf, index) => (
                        <div key={index} className="portfolio-item">
                            <input type="text" name="name" placeholder="Conference Name" value={conf.name} onChange={(e) => handleInputChange('conferences', index, e)} />
                            <input type="text" name="location" placeholder="Location (e.g., Online)" value={conf.location} onChange={(e) => handleInputChange('conferences', index, e)} />
                            <input type="date" name="date" value={conf.date ? new Date(conf.date).toISOString().split('T')[0] : ''} onChange={(e) => handleInputChange('conferences', index, e)} />
                            <button type="button" onClick={() => handleRemoveItem('conferences', index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={() => handleAddItem('conferences', { name: '', location: '', date: '' })}>+ Add Conference</button>
                </div>

                <hr/>
                {success && <div className="success-message">{success}</div>}
                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="button button-primary save-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Portfolio'}
                </button>
            </form>
        </div>
    );
};

export default StudentPortfolioPage;