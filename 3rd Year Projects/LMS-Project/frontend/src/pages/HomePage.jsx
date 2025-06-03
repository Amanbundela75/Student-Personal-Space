// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './HomePage.css'; // We'll create this new CSS file

// Placeholder icons - ideally, you'd use an icon library like React Icons or SVGs
const FeatureIcon1 = () => <span className="feature-icon">🎓</span>; // Graduation Cap
const FeatureIcon2 = () => <span className="feature-icon">📚</span>; // Books
const FeatureIcon3 = () => <span className="feature-icon">💡</span>; // Lightbulb

const HomePage = () => {
    const { currentUser, isAdmin } = useAuth();

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Unlock Your Potential with Aman's LMS</h1>
                    <p className="hero-subtitle">
                        Your premier destination for quality online education, tailored to your learning journey.
                    </p>
                    <div className="hero-cta-buttons">
                        <Link to="/courses" className="button button-hero-primary">Explore Courses</Link>
                        {!currentUser && ( // Show register button only if not logged in
                            <Link to="/register" className="button button-hero-secondary">Get Started</Link>
                        )}
                        {currentUser && !isAdmin && (
                            <Link to="/student/dashboard" className="button button-hero-secondary">My Dashboard</Link>
                        )}
                        {currentUser && isAdmin && (
                            <Link to="/admin/dashboard" className="button button-hero-secondary">Admin Panel</Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose Us?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <FeatureIcon1 />
                            <h3>Expert-Led Courses</h3>
                            <p>Learn from industry professionals and experienced educators across various domains.</p>
                        </div>
                        <div className="feature-card">
                            <FeatureIcon2 />
                            <h3>Flexible Learning</h3>
                            <p>Access your courses anytime, anywhere, and learn at your own pace on any device.</p>
                        </div>
                        <div className="feature-card">
                            <FeatureIcon3 />
                            <h3>Career Advancement</h3>
                            <p>Gain new skills and knowledge to boost your career prospects and achieve your goals.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Optional: Call to Action Section (Example) */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Start Learning?</h2>
                    <p>Join thousands of students who are transforming their lives through education.</p>
                    <Link to={currentUser ? "/courses" : "/register"} className="button button-cta">
                        {currentUser ? "Browse More Courses" : "Sign Up Today"}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;