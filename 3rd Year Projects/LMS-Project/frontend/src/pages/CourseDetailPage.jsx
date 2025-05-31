import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById } from '../api/courses';
import { enrollInCourseApi, fetchMyEnrollments } from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, token, currentUser } = useAuth();

    useEffect(() => {
        const loadCourseDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const courseData = await fetchCourseById(courseId);
                setCourse(courseData);

                if (isAuthenticated && currentUser?.user?.role === 'student' && courseData) {
                    const enrollmentsData = await fetchMyEnrollments(token);
                    setIsEnrolled(enrollmentsData.some(e => e.course._id === courseData._id));
                }
            } catch (err) {
                setError('Failed to load course details.');
                console.error(err);
            }
            setLoading(false);
        };
        loadCourseDetails();
    }, [courseId, isAuthenticated, token, currentUser]);

    const handleEnroll = async () => {
        if (!isAuthenticated || currentUser.user.role !== 'student') {
            alert('Please login as a student to enroll.');
            return;
        }
        if (window.confirm(`Are you sure you want to enroll in "${course.title}"?`)) {
            try {
                const response = await enrollInCourseApi(course._id, token);
                if (response.success) {
                    alert('Successfully enrolled!');
                    setIsEnrolled(true);
                } else {
                    alert(`Enrollment failed: ${response.message}`);
                }
            } catch (error) {
                alert(`Error enrolling: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    if (loading) return <p>Loading course details...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!course) return <p>Course not found.</p>;

    return (
        <div className="container">
            <h1>{course.title}</h1>
            <p><strong>Branch:</strong> {course.branch ? course.branch.name : 'N/A'}</p>
            <p><strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
            <hr/>
            <h3>Course Description</h3>
            <p>{course.description}</p>
            {/* In a real LMS, you'd list modules, lessons, materials here */}
            <div style={{margin: "20px 0"}}>
                {isAuthenticated && currentUser?.user?.role === 'student' ? (
                    isEnrolled ? (
                        <>
                            <p className="success-message">You are enrolled in this course.</p>
                            <Link to={`/courses/${course._id}/study`} className="button button-primary">
                                Start Studying / Continue
                            </Link>
                        </>
                    ) : (
                        <button onClick={handleEnroll} className="button button-primary">Enroll Now</button>
                    )
                ) : (
                    !isAuthenticated && <Link to="/login" className="button">Login to Enroll</Link>
                )}
            </div>

            <Link to="/courses" className="button" style={{backgroundColor: "#7f8c8d"}}>Back to Courses</Link>
        </div>
    );
};

export default CourseDetailPage;