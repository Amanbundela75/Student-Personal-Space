import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motion } from 'framer-motion';

// SLIDER IMPORTS
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import './HomePage.css'; // Aapki CSS file

// --- Components ---

const FeatureIcon = ({ children }) => <span className="feature-icon">{children}</span>;

const CourseCard = ({ course, index }) => (
    <motion.div
        className="course-card"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
    >
        <img src={course.img} alt={course.title} className="course-img" />
        <div className="content">
            <h4>{course.title}</h4>
            <p>{course.desc}</p>
            <Link to="/courses" className="button button-small">View Course</Link>
        </div>
    </motion.div>
);

const TestimonialCard = ({ testimonial }) => (
    <div className="testimonial-card-wrapper">
        <div className="testimonial-card">
            <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
            <p>"{testimonial.feedback}"</p>
            <span className="testimonial-name">- {testimonial.name}</span>
        </div>
    </div>
);


// --- Data ---

const featuredCourses = [
    { id: 1, title: "Full Stack Web Development", desc: "Master MERN stack and build real-world projects.", img: "/images/courses/webdev.jpg" },
    { id: 2, title: "Data Science Bootcamp", desc: "Learn Python, ML, and Data Analytics from scratch.", img: "/images/courses/datascience.jpg" },
    { id: 3, title: "Digital Marketing Essentials", desc: "Grow your brand with effective online strategies.", img: "/images/courses/marketing.jpg" }
];

const testimonials = [
    { id: 1, name: "Priya Sharma", feedback: "This LMS changed my life! The teachers are super helpful and content is up-to-date.", avatar: "/images/students/priya.jpg" },
    { id: 2, name: "Rahul Verma", feedback: "I got my first job after completing the Full Stack course here. Highly recommend!", avatar: "/images/students/rahul.jpg" },
    { id: 3, name: "Sunita Kaur", feedback: "The flexible learning schedule helped me a lot. The courses are amazing!", avatar: "/images/students/sunita.jpg" }
];


// --- Main HomePage Component ---

const HomePage = () => {
    const { currentUser, isAdmin } = useAuth();

    // Slider settings
    const testimonialSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        fade: true,
        cssEase: 'linear'
    };

    // Animation variants for Hero Section
    const heroContentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { staggerChildren: 0.3, delayChildren: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="homepage">
            {/* Background Video Section */}
            <div className="hero-video-container">
                <video autoPlay loop muted playsInline className="background-video" poster="/images/bg_fallback.jpg">
                    <source src="/videos/Home_Background.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="video-overlay"></div>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    variants={heroContentVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={itemVariants} className="hero-title">Unlock Your Potential with Aman's LMS</motion.h1>
                    <motion.p variants={itemVariants} className="hero-subtitle">
                        Your premier destination for quality online education, tailored to your learning journey.
                    </motion.p>
                    <motion.div variants={itemVariants} className="hero-cta-buttons">
                        <Link to="/courses" className="button button-hero-primary">Explore Courses</Link>
                        {!currentUser && <Link to="/register" className="button button-hero-secondary">Get Started</Link>}
                        {currentUser && !isAdmin && <Link to="/student/dashboard" className="button button-hero-secondary">My Dashboard</Link>}
                        {currentUser && isAdmin && <Link to="/admin/dashboard" className="button button-hero-secondary">Admin Panel</Link>}
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <motion.section
                className="features-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="container">
                    <h2 className="section-title">Why Choose Us?</h2>
                    <div className="features-grid">
                        <motion.div className="feature-card" whileHover={{ y: -10 }}>
                            <FeatureIcon>🎓</FeatureIcon>
                            <h3>Expert-Led Courses</h3>
                            <p>Learn from industry professionals and experienced educators.</p>
                        </motion.div>
                        <motion.div className="feature-card" whileHover={{ y: -10 }}>
                            <FeatureIcon>📚</FeatureIcon>
                            <h3>Flexible Learning</h3>
                            <p>Access your courses anytime, anywhere, and learn at your own pace.</p>
                        </motion.div>
                        <motion.div className="feature-card" whileHover={{ y: -10 }}>
                            <FeatureIcon>💡</FeatureIcon>
                            <h3>Career Advancement</h3>
                            <p>Gain new skills and knowledge to boost your career prospects.</p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Statistics Section */}
            <motion.section
                className="stats-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3 className="stat-number">10,000+</h3>
                            <p className="stat-label">Happy Students</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number">50+</h3>
                            <p className="stat-label">Expert Courses</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number">20+</h3>
                            <p className="stat-label">Instructors</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number">95%</h3>
                            <p className="stat-label">Completion Rate</p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Featured Courses Section */}
            <motion.section
                className="featured-courses-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="container">
                    <h2 className="section-title">Featured Courses</h2>
                    <div className="courses-grid">
                        {featuredCourses.map((course, idx) => (
                            <CourseCard key={course.id} course={course} index={idx} />
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Testimonials Section */}
            <motion.section
                className="testimonials-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="container">
                    <h2 className="section-title">What Our Students Say</h2>
                    <div className="testimonial-carousel-container">
                        <Slider {...testimonialSettings}>
                            {testimonials.map((t) => (
                                <TestimonialCard key={t.id} testimonial={t} />
                            ))}
                        </Slider>
                    </div>
                </div>
            </motion.section>

            {/* =================================================== */}
            {/*      Call to Action Section (YAHAN BADLAAV HUA HAI)     */}
            {/* =================================================== */}
            <motion.section
                className="cta-section"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="cta-content">
                    <h2>Ready to Start Learning?</h2>
                    <p>Join thousands of students who are transforming their lives through education.</p>
                    <Link to={currentUser ? "/courses" : "/register"} className="button button-cta">
                        {currentUser ? "Browse More Courses" : "Sign Up Today"}
                    </Link>
                </div>
            </motion.section>
        </div>
    );
};

export default HomePage;