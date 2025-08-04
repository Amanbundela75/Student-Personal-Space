import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById } from '../api/courses';
import {
    enrollInCourseApi,
    fetchMyEnrollments,
    markContentCompleteApi,
    markContentIncompleteApi
} from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaYoutube, FaStickyNote } from 'react-icons/fa'; // Icons ke liye
import './CourseDetail.css'; // Aapki CSS file

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentEnrollment, setCurrentEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, token, currentUser } = useAuth();
    const [activeVideo, setActiveVideo] = useState(null);

    const loadCourseDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const courseData = await fetchCourseById(courseId);
            setCourse(courseData);

            if (courseData && courseData.youtubeVideos && courseData.youtubeVideos.length > 0) {
                setActiveVideo(courseData.youtubeVideos[0]);
            }

            if (isAuthenticated && currentUser?.user?.role === 'student' && courseData) {
                const enrollmentsData = await fetchMyEnrollments(token);
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
    }, [courseId, isAuthenticated, token]);

    const handleEnroll = async () => {
        // (Is function mein koi badlav nahi)
    };

    const handleToggleComplete = async (contentId, isCompleted) => {
        // (Is function mein koi badlav nahi)
    };

    const progressPercentage = useMemo(() => {
        // (Is function mein koi badlav nahi)
    }, [currentEnrollment, course]);

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p className="error-message">{error}</p></div>;
    if (!course) return <div className="container"><p>Course not found.</p></div>;

    const isEnrolled = !!currentEnrollment;

    // --- UPDATE: YouTube URL mein loop parameters add kiye gaye hain ---
    const youtubeUrl = activeVideo
        ? `https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&mute=1&loop=1&playlist=${activeVideo.videoId}&rel=0&controls=0`
        : '';
    // controls=0 se video ke neeche ke buttons (play, pause, etc.) chhip jaate hain

    return (
        <div className="container course-detail-page">
            <h1 className="course-title">{course.title}</h1>
            <p><strong>Branch:</strong> {course.branch?.name || 'N/A'} | <strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
            <hr/>

            {isEnrolled ? (
                <div className="course-layout">
                    {/* Left Side: Video Player */}
                    <div className="video-player-container">
                        <div className="video-player">
                            {activeVideo ? (
                                <iframe
                                    key={activeVideo._id}
                                    width="100%"
                                    height="100%"
                                    src={youtubeUrl}
                                    title={activeVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="video-placeholder">
                                    <p>Select a video from the playlist to start watching.</p>
                                </div>
                            )}
                        </div>
                        <h3 className="video-title">{activeVideo?.title || 'No video selected'}</h3>
                        <p>{activeVideo?.description}</p>
                    </div>

                    {/* Right Side: Progress and Content List */}
                    <div className="content-sidebar">
                        <h3>Your Progress: {progressPercentage}%</h3>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                        </div>

                        <h3 className="content-header">Course Content</h3>
                        <div className="content-list">
                            {course.youtubeVideos.map(video => {
                                const isCompleted = currentEnrollment.completedContent.includes(video._id);
                                return (
                                    <div
                                        key={video._id}
                                        className={`content-item video-item ${activeVideo?._id === video._id ? 'active' : ''}`}
                                        onClick={() => setActiveVideo(video)}
                                    >
                                        <input
                                            type="checkbox"
                                            id={video._id}
                                            checked={isCompleted}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleToggleComplete(video._id, isCompleted);
                                            }}
                                        />
                                        <label htmlFor={video._id} onClick={(e) => e.stopPropagation()}>
                                            <FaYoutube className="icon" /> {video.title}
                                        </label>
                                    </div>
                                );
                            })}
                            {course.notes.map(note => {
                                const isCompleted = currentEnrollment.completedContent.includes(note._id);
                                return (
                                    <div key={note._id} className="content-item note-item">
                                        <input
                                            type="checkbox"
                                            id={note._id}
                                            checked={isCompleted}
                                            onChange={() => handleToggleComplete(note._id, isCompleted)}
                                        />
                                        <label htmlFor={note._id}>
                                            <FaStickyNote className="icon" /> {note.title} (Notes)
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="enrollment-section">
                    <h3>Course Description</h3>
                    <p>{course.description}</p>
                    {isAuthenticated && currentUser?.user?.role === 'student' ? (
                        <button onClick={handleEnroll} className="button button-primary">Enroll Now</button>
                    ) : (
                        !isAuthenticated && <Link to="/login" className="button">Login to Enroll</Link>
                    )}
                </div>
            )}

            <Link to="/courses" className="button" style={{backgroundColor: "#7f8c8d", marginTop: '20px'}}>Back to Courses</Link>
        </div>
    );
};

export default CourseDetailPage;