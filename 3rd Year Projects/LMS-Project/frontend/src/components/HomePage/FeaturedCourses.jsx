import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Data ---
const featuredCoursesData = [
    { id: 1, title: "Full Stack Web Development", desc: "Master MERN stack and build real-world projects.", img: "/images/web-design.webp" }, // .webp format
    { id: 2, title: "Data Science Bootcamp", desc: "Learn Python, ML, and Data Analytics from scratch.", img: "/images/data-science.webp" }, // .webp format
    { id: 3, title: "Digital Marketing Essentials", desc: "Grow your brand with effective online strategies.", img: "/images/digital-marketing.webp" } // .webp format
];

const CourseCard = ({ course, index }) => (
    <motion.div
        className="course-card"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
    >
        {/* === LAZY LOADING ENABLED === */}
        <img src={course.img} alt={course.title} className="course-img" loading="lazy" />
        <div className="content">
            <h4>{course.title}</h4>
            <p>{course.desc}</p>
            <Link to="/courses" className="button button-small">View Course</Link>
        </div>
    </motion.div>
);

const FeaturedCourses = () => (
    <section className="featured-courses-section">
        <div className="container">
            <h2 className="section-title">Featured Courses</h2>
            <div className="courses-grid">
                {featuredCoursesData.map((course, idx) => (
                    <CourseCard key={course.id} course={course} index={idx} />
                ))}
            </div>
        </div>
    </section>
);

export default FeaturedCourses;