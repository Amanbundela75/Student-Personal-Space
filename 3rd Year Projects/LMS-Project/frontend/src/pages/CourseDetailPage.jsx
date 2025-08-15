import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById } from '../api/courses';
import { enrollInCourseApi, fetchMyEnrollments } from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaPencilAlt } from 'react-icons/fa';
import './CourseDetail.css';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentEnrollment, setCurrentEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, token, currentUser } = useAuth();

    const isAdmin = currentUser?.user?.role === 'admin';

    useEffect(() => {
        const loadCourseDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetchCourseById(courseId);

                // === ERROR FIX START ===
                // Now we can safely access response.data because our API is consistent
                if (response && response.success) {
                    setCourse(response.data);

                    if (isAuthenticated && currentUser?.user?.role === 'student' && response.data) {
                        const enrollmentsResponse = await fetchMyEnrollments(token);
                        // The enrollments API also returns a 'data' property
                        const enrollment = enrollmentsResponse.data.find(e => e.course._id === response.data._id);
                        setCurrentEnrollment(enrollment || null);
                    }
                } else {
                    throw new Error(response?.message || 'Course could not be loaded.');
                }
                // === ERROR FIX END ===

            } catch (err) {
                setError(err.message || 'Failed to load course details.');
                console.error(err);
            }
            setLoading(false);
        };

        loadCourseDetails();
    }, [courseId, isAuthenticated, token, currentUser]);

    const handleEnroll = async () => {
        try {
            await enrollInCourseApi(courseId, token);
            // Re-fetch details to update UI after enrollment
            const response = await fetchCourseById(courseId);
            if(response.success) setCourse(response.data);
        } catch (err) {
            setError('Failed to enroll in the course.');
        }
    };

    if (loading) return <div className="container loading-container"><p>Loading Course...</p></div>;

    if (error || !course) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h2>Course Not Found</h2>
                <p>{error || "The course you are looking for does not exist or may have been moved."}</p>
                <Link to="/courses" className="button button-primary">Back to All Courses</Link>
            </div>
        );
    }

    const isEnrolled = !!currentEnrollment;

    return (
        <div className="container course-detail-page">
            <div className="page-header">
                <div className="header-text">
                    <h1>{course.title}</h1>
                    <p><strong>Branch:</strong> {course.branch?.name || 'N/A'} | <strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
                </div>

                {isAdmin && (
                    <Link to={`/admin/course/${courseId}/content`} className="btn-manage-content">
                        <FaPencilAlt /> Manage Course Content
                    </Link>
                )}
            </div>

            {isEnrolled ? (
                <div className="public-view-container">
                    <p style={{fontSize: '1.2rem', fontWeight: '500'}}>You are already enrolled in this course.</p>
                    <Link to={`/courses/${courseId}/study`} className="btn-enroll" style={{marginTop: '1rem'}}>
                        Start Studying
                    </Link>
                </div>
            ) : (
                <div className="public-view-container">
                    <h3>Course Description</h3>
                    <p>{course.description}</p>
                    {isAuthenticated && currentUser?.user?.role === 'student' && (
                        <button onClick={handleEnroll} className="btn-enroll">Enroll Now</button>
                    )}
                    {!isAuthenticated && (
                        <Link to="/login" className="btn-enroll">Login to Enroll</Link>
                    )}
                </div>
            )}

            <Link to="/courses" className="btn-back">Back to Courses</Link>
        </div>
    );
};

export default CourseDetailPage;