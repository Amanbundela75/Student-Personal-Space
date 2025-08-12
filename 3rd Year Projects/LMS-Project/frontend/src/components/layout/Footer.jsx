import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Existing CSS file

// GitHub aur LinkedIn icons import karein
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-main">
                {/* Column 1: Logo, Description & Social Icons */}
                <div className="footer-column">
                    <h4 className="footer-logo">
                        <span className="logo-box">ITM</span> Learning Hub
                    </h4>
                    <p className="footer-description">
                        Empowering learners with intelligent tooling, authentic evaluation & purposeful mentorship.
                    </p>
                    <div className="social-icons">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
                    </div>
                </div>

                {/* Column 2: Platform */}
                <div className="footer-column">
                    <h4>Platform</h4>
                    <ul>
                        <li><Link to="/student/dashboard">Dashboard</Link></li>
                        <li><Link to="/student/portfolio">Portfolio</Link></li>
                        <li><Link to="/proctored-tests">Proctored Tests</Link></li>
                        <li><Link to="/mentorship">Mentorship</Link></li>
                    </ul>
                </div>

                {/* Column 3: Resources */}
                <div className="footer-column">
                    <h4>Resources</h4>
                    <ul>
                        <li><Link to="/docs">Documentation</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/features">Feature Overview</Link></li>
                    </ul>
                </div>

                {/* Column 4: Legal */}
                <div className="footer-column">
                    <h4>Legal</h4>
                    <ul>
                        <li><Link to="/terms">Terms</Link></li>
                        <li><Link to="/privacy">Privacy</Link></li>
                        <li><Link to="/cookies">Cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Aman's Learning Hub. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;