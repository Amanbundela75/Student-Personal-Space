import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
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
                        <li><Link to="/portfolio">Portfolio</Link></li>
                        <li><a href="/#tests">Proctored Tests</a></li>
                        <li><a href="/#mentorship">Mentorship</a></li>
                    </ul>
                </div>

                {/* Column 3: Resources */}
                <div className="footer-column">
                    <h4>Resources</h4>
                    <ul>
                        <li><Link to="/roadmaps">Documentation</Link></li>
                        {/* === FAQ LINK CORRECTED HERE === */}
                        {/* Using <a> tag to ensure it scrolls to the section on the homepage */}
                        <li><a href="/#faq">FAQ</a></li>
                        <li><a href="/#features">Feature Overview</a></li>
                    </ul>
                </div>

                {/* Column 4: Legal */}
                <div className="footer-column">
                    <h4>Legal</h4>
                    <ul>
                        {/* === LEGAL LINKS CORRECTED TO PREVENT 404 ERROR === */}
                        {/* These now point to the homepage. Update them later when you create the pages. */}
                        <li><Link to="/">Terms</Link></li>
                        <li><Link to="/">Privacy</Link></li>
                        <li><Link to="/">Cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} ITM Learning Hub. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;