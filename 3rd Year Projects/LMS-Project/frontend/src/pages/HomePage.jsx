import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motion } from 'framer-motion'; // AnimatePresence yahan se hata diya hai

// Sahi path, jaisa aapne bataya tha
import FeatureCard from '../components/HomePage/FeatureCard';

// CSS Imports
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './HomePage.css';


// Data for the feature cards
const featuresData = [
    {
        id: 1,
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
        title: "Personal Dashboard",
        short_description: "Your own personal space where you can manage everything.",
        detailed_description: "Track your course progress, view upcoming deadlines, manage your assignments, and see your results all in one centralized hub. Your dashboard is designed to keep you organized and focused on your goals."
    },
    {
        id: 2,
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M2 8c0-2.2.7-4.3 2-6"></path><path d="M22 8c0-2.2-.7-4.3-2-6"></path></svg>,
        title: "Direct Connectivity",
        short_description: "Connect directly with your Mentor and the TAP Cell.",
        detailed_description: "Schedule one-on-one sessions with your assigned mentor, get your doubts cleared, and receive career guidance directly from the TAP cell through a seamless communication channel built right into the platform."
    },
    {
        id: 3,
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
        title: "Effective Guidance",
        short_description: "Receive personalized support and guidance to achieve your goals.",
        detailed_description: "Based on your progress and test results, your mentors provide targeted feedback and create a personalized roadmap for you. This data-driven approach ensures your efforts are always in the right direction for maximum impact."
    }
];


// --- Main HomePage Component ---
const HomePage = () => {
    const { currentUser } = useAuth();
    const [expandedIndex, setExpandedIndex] = useState(null);

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
                    {featuresData.map((feature, index) => (
                        <FeatureCard
                            key={feature.id}
                            feature={feature}
                            index={index}
                            expandedIndex={expandedIndex}
                            setExpandedIndex={setExpandedIndex}
                        />
                    ))}
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

            {/* === MENTORSHIP SECTION === */}
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
                        <div className="mentor-card">
                            <img src="/images/seniors/mentor1.jpg" alt="Senior Mentor 1" className="mentor-photo" />
                            <h3 className="mentor-name">Priya Sharma</h3>
                            <p className="mentor-role">Software Engineer @ Google</p>
                            <Link to="/seniors/priya-sharma" className="mentor-roadmap-link">View Roadmap</Link>
                        </div>
                        <div className="mentor-card">
                            <img src="/images/seniors/mentor2.jpg" alt="Senior Mentor 2" className="mentor-photo" />
                            <h3 className="mentor-name">Rohan Verma</h3>
                            <p className="mentor-role">Data Scientist @ Microsoft</p>
                            <Link to="/seniors/rohan-verma" className="mentor-roadmap-link">View Roadmap</Link>
                        </div>
                        <div className="mentor-card">
                            <img src="/images/seniors/mentor3.jpg" alt="Senior Mentor 3" className="mentor-photo" />
                            <h3 className="mentor-name">Anjali Singh</h3>
                            <p className="mentor-role">Product Manager @ Amazon</p>
                            <Link to="/seniors/anjali-singh" className="mentor-roadmap-link">View Roadmap</Link>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* === RESEARCH ACCESS SECTION === */}
            <motion.section
                className="research-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="research-content">
                    <div className="research-image">
                        <img src="/images/research-library.svg" alt="Research Paper Library" />
                    </div>
                    <div className="research-text">
                        <h2 className="research-title">Stay Ahead of the Curve</h2>
                        <p className="research-subtitle">Unlock your potential with free access to a curated library of contemporary research papers, updated yearly to keep you at the forefront of innovation.</p>
                        <ul className="research-features">
                            <li>🔬 Explore the latest breakthroughs in your field.</li>
                            <li>📚 Empower your projects with credible, high-quality resources.</li>
                            <li>🔄 Gain fresh insights every year with our updated collection.</li>
                        </ul>
                    </div>
                </div>
            </motion.section> {/* <-- YEH TAG GALAT THA, AB THEEK HAI --> */}

            {/* === PROCTORED TESTS SECTION === */}
            <motion.section
                className="proctored-tests-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="proctored-tests-content">
                    <h2 className="proctored-tests-title">Forge Your Skills Under Real-World Conditions</h2>
                    <p className="proctored-tests-subtitle">Prepare for your interviews with fully proctored tests designed by successful seniors, ensuring you build genuine skills without shortcuts.</p>
                    <div className="proctored-features-grid">
                        <div className="proctored-feature-card">
                            <div className="proctored-feature-icon">🎓</div>
                            <h3>Tests by Achievers</h3>
                            <p>Tackle interview tests designed by seniors who know what it takes to succeed in top companies.</p>
                        </div>
                        <div className="proctored-feature-card">
                            <div className="proctored-feature-icon">🛡️</div>
                            <h3>Proctored for Integrity</h3>
                            <p>Our anti-cheating measures ensure you prepare honestly, building real skills for real interviews.</p>
                        </div>
                        <div className="proctored-feature-card">
                            <div className="proctored-feature-icon">📈</div>
                            <h3>Trackable Progress</h3>
                            <p>Every test score contributes to your profile for you, your mentor, and the TAP Cell to review.</p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* === SUBJECT MASTERY SECTION === */}
            <motion.section
                className="subject-tests-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="subject-tests-content">
                    <h2 className="subject-tests-title">Master the Fundamentals</h2>
                    <p className="subject-tests-subtitle">Strengthen your core knowledge with dedicated tests for every crucial subject. A strong foundation is the key to your future career success.</p>
                    <div className="subject-grid">
                        <div className="subject-card">
                            <div className="subject-icon">💻</div>
                            <h3>Data Structures</h3>
                        </div>
                        <div className="subject-card">
                            <div className="subject-icon">🧠</div>
                            <h3>Algorithms</h3>
                        </div>
                        <div className="subject-card">
                            <div className="subject-icon">⚙️</div>
                            <h3>Operating Systems</h3>
                        </div>
                        <div className="subject-card">
                            <div className="subject-icon">🌐</div>
                            <h3>Computer Networks</h3>
                        </div>
                        <div className="subject-card">
                            <div className="subject-icon">🗃️</div>
                            <h3>DBMS</h3>
                        </div>
                        <div className="subject-card">
                            <div className="subject-icon">👨‍💻</div>
                            <h3>Object-Oriented Programming</h3>
                        </div>
                    </div>
                </div>
            </motion.section>

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