import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById } from '../api/courses';
import { enrollInCourseApi, fetchMyEnrollments, markContentCompleteApi } from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaYoutube, FaStickyNote, FaBookOpen, FaPencilAlt } from 'react-icons/fa'; // FaPencilAlt import karein
import './CourseDetail.css';

// ... (Your other sub-components like ContentPlayer, ContentSidebar can remain here if they are in the same file)

// Main Page Component
const CourseDetailPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentEnrollment, setCurrentEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, token, currentUser } = useAuth(); // currentUser yahan zaroori hai
    const [activeContent, setActiveContent] = useState(null);

    // === ADMIN CHECK START ===
    // Check if the logged-in user is an admin
    const isAdmin = currentUser?.user?.role === 'admin';
    // === ADMIN CHECK END ===

    const loadCourseDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const courseData = await fetchCourseById(courseId);
            setCourse(courseData);

            if (isAuthenticated && currentUser?.user?.role === 'student' && courseData) {
                const enrollmentsData = await fetchMyEnrollments(token);
                const enrollment = enrollmentsData.find(e => e.course._id === courseData._id);
                setCurrentEnrollment(enrollment || null);

                if (enrollment && courseData.youtubeVideos && courseData.youtubeVideos.length > 0) {
                    setActiveContent({ ...courseData.youtubeVideos[0], type: 'video' });
                }
            }
        } catch (err) {
            setError('Failed to load course details.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCourseDetails();
    }, [courseId, isAuthenticated, token, currentUser]); // currentUser ko dependency mein add karein

    const handleEnroll = async () => {
        try {
            await enrollInCourseApi(courseId, token);
            await loadCourseDetails();
        } catch (err) {
            setError('Failed to enroll in the course.');
        }
    };

    const handleToggleComplete = async (contentId, isCompleted) => {
        // ... (function code remains same)
    };

    if (loading) return <div className="container loading-container"><p>Loading Course...</p></div>;
    if (error) return <div className="container error-container"><p className="error-message">{error}</p></div>;
    if (!course) return <div className="container"><p>Course not found.</p></div>;

    const isEnrolled = !!currentEnrollment;

    return (
        <div className="container course-detail-page">
            <div className="page-header">
                <div className="header-text">
                    <h1>{course.title}</h1>
                    <p><strong>Branch:</strong> {course.branch?.name || 'N/A'} | <strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
                </div>

                {/* === ADMIN BUTTON START === */}
                {/* Yeh button sirf admin ko dikhega */}
                {isAdmin && (
                    <Link to={`/admin/course/${courseId}/content`} className="btn-manage-content">
                        <FaPencilAlt /> Manage Course Content
                    </Link>
                )}
                {/* === ADMIN BUTTON END === */}
            </div>

            {isEnrolled ? (
                // ... (Your enrolled view JSX here)
                <p>You are enrolled in this course. <Link to={`/courses/${courseId}/study`}>Start Studying</Link></p>
            ) : (
                <div className="public-view-container">
                    <h3>Course Description</h3>
                    <p>{course.description}</p>
                    {/* Enroll button logic for students */}
                    {isAuthenticated && currentUser?.user?.role === 'student' && (
                        <button onClick={handleEnroll} className="btn-enroll">Enroll Now</button>
                    )}
                    {/* Login button for guests */}
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