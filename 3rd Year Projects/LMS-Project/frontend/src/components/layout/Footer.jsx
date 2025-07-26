import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Nayi CSS file import karein

// React Icons se icons import karein
import { FaFacebookF, FaTwitter, FaGoogle, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-main">
                {/* Column 1: Address & Social */}
                <div className="footer-column">
                    <h4>Aman's LMS</h4>
                    <div className="footer-address">
                        <p>
                            <strong>Corporate Address:</strong><br />
                            A-143, 7th Floor, Sovereign Corporate Tower, Sector- 136, Noida, Uttar Pradesh (201305)
                        </p>
                        <p>
                            <strong>Registered Address:</strong><br />
                            K 061, Tower K, Gulshan Vivante Apartment, Sector 137, Noida, Gautam Buddh Nagar, Uttar Pradesh, 201305
                        </p>
                    </div>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                    </div>
                </div>

                {/* Column 2: Company */}
                <div className="footer-column">
                    <h4>Company</h4>
                    <ul>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/careers">Careers</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link to="/terms-of-service">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Column 3: Explore */}
                <div className="footer-column">
                    <h4>Explore</h4>
                    <ul>
                        <li><Link to="/courses">All Courses</Link></li>
                        <li><Link to="/quizzes">Quizzes</Link></li>
                        <li><Link to="/practice">Practice Problems</Link></li>
                        <li><Link to="/student/dashboard">My Dashboard</Link></li>
                        <li><Link to="/leaderboard">Leaderboard</Link></li>
                    </ul>
                </div>

                {/* Column 4: Technologies */}
                <div className="footer-column">
                    <h4>Technologies</h4>
                    <ul>
                        <li><Link to="/courses/html">HTML</Link></li>
                        <li><Link to="/courses/css">CSS</Link></li>
                        <li><Link to="/courses/javascript">JavaScript</Link></li>
                        <li><Link to="/courses/react">ReactJS</Link></li>
                        <li><Link to="/courses/nodejs">Node.js</Link></li>
                    </ul>
                </div>

                {/* Column 5: Subjects */}
                <div className="footer-column">
                    <h4>Subjects</h4>
                    <ul>
                        <li><Link to="/courses/dsa">Data Structures</Link></li>
                        <li><Link to="/courses/algo">Algorithms</Link></li>
                        <li><Link to="/courses/dbms">DBMS</Link></li>
                        <li><Link to="/courses/os">Operating Systems</Link></li>
                        <li><Link to="/courses/cn">Computer Networks</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Aman's Learning Platform. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;