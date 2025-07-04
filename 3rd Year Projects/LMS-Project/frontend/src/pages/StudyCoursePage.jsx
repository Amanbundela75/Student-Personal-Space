import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById } from '../api/courses.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import YouTube from 'react-youtube';

const StudyCoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const loadCourseDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const courseData = await fetchCourseById(courseId);
                setCourse(courseData);
            } catch (err) {
                console.error("Failed to load course details:", err);
                setError(err.response?.data?.message || err.message || 'Failed to load course content.');
            }
            setLoading(false);
        };
        if (courseId) {
            loadCourseDetails();
        }
    }, [courseId]);

    const playerOptions = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 0,
        },
    };

    if (loading) return <div className="container"><p>Loading course content...</p></div>;
    if (error) return <div className="container"><p className="error-message">{error}</p></div>;
    if (!course) return <div className="container"><p>Course not found.</p></div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                <h1>Studying: {course.title}</h1>
                <Link to={`/course/${courseId}/tests`}>
                    <button className="button button-primary">
                        View Available Tests
                    </button>
                </Link>
            </div>

            <p>{course.description}</p>
            <Link to="/my-courses" className="button" style={{marginBottom: '20px', display:'inline-block'}}>Back to My Courses</Link>

            <hr />

            {course.youtubeVideos && course.youtubeVideos.length > 0 && (
                <section style={{ marginTop: '30px' }}>
                    <h2>Course Videos</h2>
                    {course.youtubeVideos.map((video, index) => (
                        <div key={video._id || index} style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                            <h3>{video.title || `Video ${index + 1}`}</h3>
                            {video.description && <p><small>{video.description}</small></p>}
                            {video.videoId ? (
                                <YouTube videoId={video.videoId} opts={playerOptions} />
                            ) : (
                                <p>Video link missing or invalid.</p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {course.notes && course.notes.length > 0 && (
                <section style={{ marginTop: '30px' }}>
                    <h2>Course Notes</h2>
                    {course.notes.map((note, index) => (
                        <div key={note._id || index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <h3>{note.title || `Note ${index + 1}`}</h3>
                            {note.content && <div dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br />') }} />}
                            {note.url && (
                                <p>
                                    <a href={note.url} target="_blank" rel="noopener noreferrer" className="button button-primary">
                                        View Note/Resource
                                    </a>
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {(!course.youtubeVideos || course.youtubeVideos.length === 0) &&
                (!course.notes || course.notes.length === 0) && (
                    <p>No videos or notes have been added to this course yet.</p>
                )}
        </div>
    );
};

// --- YEH LINE THEEK KAR DI GAYI HAI ---
export default StudyCoursePage;