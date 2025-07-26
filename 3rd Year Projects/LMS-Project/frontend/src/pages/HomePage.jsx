import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence ko import karein

// CSS Imports
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './HomePage.css';

// Component Imports
import FeedbackForm from '../components/student/FeedbackForm';

// === LAZY LOADED COMPONENTS ===
const FeaturedCourses = lazy(() => import('../components/HomePage/FeaturedCourses.jsx'));
const Testimonials = lazy(() => import('../components/HomePage/Testimonials.jsx'));

// === HELPER COMPONENTS & DATA (YAHAN ADD KIYE GAYE HAIN) ===

const LoadingSpinner = () => <div className="loading-spinner">Loading...</div>;

const FeatureIcon = ({ children }) => <span className="feature-icon">{children}</span>;

const FAQItem = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="faq-item">
            <motion.div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                {faq.question}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="faq-answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p>{faq.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const faqs = [
    { id: 1, question: "Do I get a certificate after completing a course?", answer: "Yes, upon successful completion of any course, you will receive a verifiable certificate from Aman's LMS." },
    { id: 2, question: "Can I access courses on my mobile device?", answer: "Absolutely! Our platform is fully responsive, allowing you to learn on the go." },
    { id: 3, question: "What are the payment options available?", answer: "We accept all major credit cards, debit cards, and UPI payments." },
];

// --- Main HomePage Component ---
const HomePage = () => {
    const { currentUser, isAdmin } = useAuth();
    const [searchQuery, setSearchQuery] = useState(''); // YEH LINE ADD KI GAYI HAI

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            alert(`Searching for: ${searchQuery}`);
        }
    };

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
                    <motion.h1 className="hero-title" variants={sectionVariants}>Unlock Your Potential with Aman's LMS</motion.h1>
                    <motion.p className="hero-subtitle" variants={sectionVariants}>Your premier destination for quality online education.</motion.p>
                    <motion.form className="hero-search-form" onSubmit={handleSearch} variants={sectionVariants}>
                        <input type="text" className="hero-search-input" placeholder="What do you want to learn today?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button type="submit" className="hero-search-button">Search</button>
                    </motion.form>
                    <motion.div className="hero-cta-buttons" variants={sectionVariants}>
                        <Link to="/courses" className="button button-hero-primary">Explore Courses</Link>
                        {!currentUser && <Link to="/register" className="button button-hero-secondary">Get Started</Link>}
                    </motion.div>
                </motion.div>
            </section>

            {/* Features & Stats Sections */}
            <motion.section className="features-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                <div className="container">
                    <h2 className="section-title">Why Choose Us?</h2>
                    <div className="features-grid">
                        <motion.div className="feature-card" whileHover={{ y: -10 }}><FeatureIcon>🎓</FeatureIcon><h3>Expert-Led Courses</h3><p>Learn from industry professionals.</p></motion.div>
                        <motion.div className="feature-card" whileHover={{ y: -10 }}><FeatureIcon>📚</FeatureIcon><h3>Flexible Learning</h3><p>Access courses anytime, anywhere.</p></motion.div>
                        <motion.div className="feature-card" whileHover={{ y: -10 }}><FeatureIcon>💡</FeatureIcon><h3>Career Advancement</h3><p>Gain skills to boost your career.</p></motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Lazy Loaded Sections */}
            <Suspense fallback={<LoadingSpinner />}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                    <FeaturedCourses />
                </motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                    <Testimonials />
                </motion.div>
            </Suspense>

            {/* FAQ Section */}
            <motion.section className="faq-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                <div className="container">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {faqs.map(faq => <FAQItem key={faq.id} faq={faq} />)}
                    </div>
                </div>
            </motion.section>

            {/* Feedback & CTA Sections */}
            {!isAdmin && (
                <motion.section className="feedback-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                    <div className="container"><h2 className="section-title">Share Your Feedback</h2><FeedbackForm /></div>
                </motion.section>
            )}
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