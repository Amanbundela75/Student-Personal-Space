import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById } from '../api/courses';
import {
    enrollInCourseApi,
    fetchMyEnrollments,
    markContentCompleteApi,   // Naya import
    markContentIncompleteApi  // Naya import
} from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';
// CSS ke liye kuch basic styles (aap isko apni CSS file mein daal sakte hain)
import './CourseDetail.css';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentEnrollment, setCurrentEnrollment] = useState(null); // Pehle isEnrolled tha, ab poora object store karenge
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, token, currentUser } = useAuth();

    // Course aur enrollment details load karne ka function
    const loadCourseDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const courseData = await fetchCourseById(courseId);
            setCourse(courseData);

            if (isAuthenticated && currentUser?.user?.role === 'student' && courseData) {
                const enrollmentsData = await fetchMyEnrollments(token);
                // Sirf boolean ke bajaye poora enrollment object find karo
                const enrollment = enrollmentsData.find(e => e.course._id === courseData._id);
                setCurrentEnrollment(enrollment || null);
            }
        } catch (err) {
            setError('Failed to load course details.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCourseDetails();
    }, [courseId, isAuthenticated, token, currentUser]);

    // Enroll hone ka function
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
                    // Enroll hone ke baad details dobara load karo taaki content dikhe
                    loadCourseDetails();
                } else {
                    alert(`Enrollment failed: ${response.message}`);
                }
            } catch (error) {
                alert(`Error enrolling: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Checkbox par click handle karne ka function
    const handleToggleComplete = async (contentId, isCompleted) => {
        try {
            let updatedEnrollment;
            if (isCompleted) {
                // Agar pehle se complete hai to incomplete karo
                updatedEnrollment = await markContentIncompleteApi(currentEnrollment._id, contentId, token);
            } else {
                // Agar complete nahi hai to complete karo
                updatedEnrollment = await markContentCompleteApi(currentEnrollment._id, contentId, token);
            }
            // Local state ko turant update karo taaki UI refresh ho
            setCurrentEnrollment(updatedEnrollment.data);
        } catch (err) {
            alert(`Failed to update progress: ${err.message}`);
        }
    };

    // Progress percentage calculate karne ke liye useMemo ka istemal
    const progressPercentage = useMemo(() => {
        if (!currentEnrollment || !course) return 0;

        const totalContent = (course.youtubeVideos?.length || 0) + (course.notes?.length || 0);
        if (totalContent === 0) return 0;

        const completedCount = currentEnrollment.completedContent?.length || 0;
        return Math.round((completedCount / totalContent) * 100);
    }, [currentEnrollment, course]);


    if (loading) return <div className="container"><p>Loading course details...</p></div>;
    if (error) return <div className="container"><p className="error-message">{error}</p></div>;
    if (!course) return <div className="container"><p>Course not found.</p></div>;

    const isEnrolled = !!currentEnrollment;

    return (
        <div className="container course-detail-page">
            <h1 className="course-title">{course.title}</h1>
            <p><strong>Branch:</strong> {course.branch ? course.branch.name : 'N/A'}</p>
            <p><strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
            <hr/>
            <h3>Course Description</h3>
            <p>{course.description}</p>

            <div className="enrollment-section">
                {isAuthenticated && currentUser?.user?.role === 'student' ? (
                    isEnrolled ? (
                        <div className="study-section">
                            <h3>Your Progress: {progressPercentage}%</h3>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            <h3 className="content-header">Course Content</h3>
                            <div className="content-list">
                                {course.youtubeVideos.map(video => {
                                    const isCompleted = currentEnrollment.completedContent.includes(video._id);
                                    return (
                                        <div key={video._id} className="content-item">
                                            <input
                                                type="checkbox"
                                                id={video._id}
                                                checked={isCompleted}
                                                onChange={() => handleToggleComplete(video._id, isCompleted)}
                                            />
                                            <label htmlFor={video._id}>
                                                <i className="icon-video"></i> {video.title} (Video)
                                            </label>
                                        </div>
                                    );
                                })}
                                {course.notes.map(note => {
                                    const isCompleted = currentEnrollment.completedContent.includes(note._id);
                                    return (
                                        <div key={note._id} className="content-item">
                                            <input
                                                type="checkbox"
                                                id={note._id}
                                                checked={isCompleted}
                                                onChange={() => handleToggleComplete(note._id, isCompleted)}
                                            />
                                            <label htmlFor={note._id}>
                                                <i className="icon-note"></i> {note.title} (Notes)
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <button onClick={handleEnroll} className="button button-primary">Enroll Now</button>
                    )
                ) : (
                    !isAuthenticated && <Link to="/login" className="button">Login to Enroll</Link>
                )}
            </div>

            <Link to="/courses" className="button" style={{backgroundColor: "#7f8c8d", marginTop: '20px'}}>Back to Courses</Link>
        </div>
    );
};

export default CourseDetailPage;