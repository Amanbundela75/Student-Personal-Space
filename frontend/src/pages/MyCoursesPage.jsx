// src/pages/MyCoursesPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyEnrollments } from '../api/enrollments.js';
import CourseCard from '../components/student/CourseCard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const MyCoursesPage = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const loadEnrolledCourses = async () => {
            if (!token) {
                setLoading(false);
                setError("You must be logged in to see your courses.");
                return;
            }
            try {
                const enrollmentsData = await fetchMyEnrollments(token);
                // Extract the full course object from each enrollment
                const courses = enrollmentsData.map(enrollment => enrollment.course);
                setEnrolledCourses(courses);
            } catch (err) {
                setError('Failed to load your enrolled courses.');
                console.error("Error loading enrolled courses:", err);
            }
            setLoading(false);
        };

        loadEnrolledCourses();
    }, [token]);

    if (loading) return <div className="container"><p style={{ textAlign: 'center', marginTop: '20px' }}>Loading your courses...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p></div>;

    return (
        <div className="container">
            <h1>My Enrolled Courses</h1>
            {enrolledCourses.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <p>You are not enrolled in any courses yet.</p>
                    <Link to="/courses" className="button button-primary" style={{marginTop: '1rem'}}>
                        Explore Available Courses
                    </Link>
                </div>
            ) : (
                <div className="courses-grid">
                    {enrolledCourses.map(course => (
                        <div className="col-md-4 mb-4" key={course._id}>
                            <CourseCard
                                course={course}
                                isEnrolled={true} // It will always be true on this page
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;