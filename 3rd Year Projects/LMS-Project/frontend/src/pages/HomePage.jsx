import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motion } from 'framer-motion';

// CSS Imports
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './HomePage.css';

// --- Main HomePage Component ---
const HomePage = () => {
    const { currentUser } = useAuth();

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="homepage">
            {/* Hero Section */}
            <div className="hero-video-container">
                <video autoPlay loop muted playsInline className="background-video" poster="/images/bg_fallback.webp">
                    <source src="/videos/Home_Background.mp4" type="video/mp4" />
                </video>
                <div className="video-overlay"></div>
            </div>
            <section className="hero-section">
                <motion.div className="hero-content" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
                    <motion.h1 className="hero-title" variants={sectionVariants}>Hello ITMians</motion.h1>
                    <motion.p className="hero-subtitle" variants={sectionVariants}>Step into the future of learning, designed just for you. 🚀</motion.p>
                    <motion.div className="hero-cta-buttons" variants={sectionVariants}>
                        {!currentUser && <Link to="/register" className="button button-hero-secondary">Get Started</Link>}
                    </motion.div>
                </motion.div>
            </section>

            {/* === SUCCESS HUB SECTION === */}
            <motion.section
                className="success-hub-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <h2 className="hub-title">Your Personal Success Hub 🚀</h2>
                <p className="hub-subtitle">Your Mentors and TAP Cell are now always with you.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>✅ Personal Dashboard</h3>
                        <p>Your own personal space where you can manage everything.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🤝 Direct Connectivity</h3>
                        <p>Connect directly with your <strong>Mentor</strong> and <strong>TAP Cell</strong>. They'll track your activities to guide you in the right direction.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🎯 Effective Guidance</h3>
                        <p>Receive personalized support and guidance to achieve your goals.</p>
                    </div>
                </div>
            </motion.section>

            {/* === PORTFOLIO SECTION === */}
            <motion.section
                className="portfolio-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="portfolio-content">
                    <div className="portfolio-text">
                        <h2 className="portfolio-title">Showcase Your Skills. Build Your Coder Identity.</h2>
                        <p className="portfolio-subtitle">Introducing the all-in-one Personal Portfolio for your campus placement, designed to bring all your coding achievements into a single, powerful profile which helps TAP Cell to track each one of students skill journey.</p>
                        <ul className="portfolio-features">
                            <li>🔗 Link profiles from GitHub, LeetCode, HackerRank, and more.</li>
                            <li>📊 Track your overall progress in Coding and Development at a glance.</li>
                            <li>📄 It can help TAP Cell to Share one simple, impressive link with recruiters.</li>
                        </ul>
                    </div>
                    <div className="portfolio-image">
                        <img src="/images/portfolio-showcase.svg" alt="Personal Portfolio Showcase" />
                    </div>
                </div>
            </motion.section>

            {/* === NEW MENTORSHIP SECTION ADDED HERE === */}
            <motion.section
                className="mentorship-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="mentorship-content">
                    <h2 className="mentorship-title">Learn from Those Who've Paved the Way</h2>
                    <p className="mentorship-subtitle">Connect with successful seniors who are ready to mentor you. They’ve shared their exact career roadmaps to guide you to success.</p>
                    <div className="mentors-grid">
                        {/* Mentor Card 1 - Replace with real data */}
                        <div className="mentor-card">
                            <img src="/images/seniors/mentor1.jpg" alt="Senior Mentor 1" className="mentor-photo" />
                            <h3 className="mentor-name">Priya Sharma</h3>
                            <p className="mentor-role">Software Engineer @ Google</p>
                            <Link to="/seniors/priya-sharma" className="mentor-roadmap-link">View Roadmap</Link>
                        </div>
                        {/* Mentor Card 2 - Replace with real data */}
                        <div className="mentor-card">
                            <img src="/images/seniors/mentor2.jpg" alt="Senior Mentor 2" className="mentor-photo" />
                            <h3 className="mentor-name">Rohan Verma</h3>
                            <p className="mentor-role">Data Scientist @ Microsoft</p>
                            <Link to="/seniors/rohan-verma" className="mentor-roadmap-link">View Roadmap</Link>
                        </div>
                        {/* Mentor Card 3 - Replace with real data */}
                        <div className="mentor-card">
                            <img src="/images/seniors/mentor3.jpg" alt="Senior Mentor 3" className="mentor-photo" />
                            <h3 className="mentor-name">Anjali Singh</h3>
                            <p className="mentor-role">Product Manager @ Amazon</p>
                            <Link to="/seniors/anjali-singh" className="mentor-roadmap-link">View Roadmap</Link>
                        </div>
                    </div>
                </div>
            </motion.section>
            {/* ======================================= */}

            {/* CTA Section */}
            <motion.section className="cta-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                <div className="cta-content">
                    <h2>Ready to Start Learning?</h2>
                    <p>Join thousands of students transforming their lives.</p>
                    <Link to={currentUser ? "/courses" : "/register"} className="button button-cta">{currentUser ? "Browse Courses" : "Sign Up Today"}</Link>
                </div>
            </motion.section>
        </div>
    );
};

export default HomePage;