import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseById, addVideoToCourse, addNoteToCourse } from '../api/courses.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const CourseContentManagementPage = () => {
    const { courseId } = useParams();
    const { token } = useAuth();

    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Video form ke liye state
    const [videoTitle, setVideoTitle] = useState('');
    const [videoIdInput, setVideoIdInput] = useState(''); // Input field ke liye naya state

    // Note form ke liye state
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const loadCourseDetails = async () => {
        try {
            const data = await fetchCourseById(courseId);
            setCourse(data);
        } catch (err) {
            setError('Failed to load course details.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCourseDetails();
    }, [courseId]);

    // --- START: BADLAV YAHAN KIYA GAYA HAI ---
    const handleVideoSubmit = async (e) => {
        e.preventDefault();

        // Helper function jo URL se YouTube ID nikalegi
        const getYouTubeId = (url) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            // Agar match milta hai aur ID 11 characters ki hai, to ID return karein, warna original input return karein
            return (match && match[2].length === 11) ? match[2] : url;
        };

        const extractedId = getYouTubeId(videoIdInput);

        if (!videoTitle || !extractedId) {
            setError('Please provide a video title and a valid YouTube URL or Video ID.');
            return;
        }

        setError('');
        setSuccess('');
        try {
            // API call mein 'extractedId' ka istemal karein
            const response = await addVideoToCourse(courseId, { title: videoTitle, videoId: extractedId }, token);
            if (response.success) {
                setSuccess('Video added successfully!');
                setCourse(response.data); // Course state ko update karein
                setVideoTitle('');
                setVideoIdInput(''); // Form ko clear karein
            } else {
                setError(response.message || 'Failed to add video.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while adding the video.');
        }
    };
    // --- END: BADLAV YAHAN KIYA GAYA HAI ---

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!noteTitle || !noteContent) {
            setError('Please provide both a note title and content.');
            return;
        }
        setError('');
        setSuccess('');
        try {
            const response = await addNoteToCourse(courseId, { title: noteTitle, content: noteContent }, token);
            if (response.success) {
                setSuccess('Note added successfully!');
                setCourse(response.data); // Course state ko update karein
                setNoteTitle('');
                setNoteContent('');
            } else {
                setError(response.message || 'Failed to add note.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while adding the note.');
        }
    };

    if (isLoading) return <p>Loading content details...</p>;
    if (error && !course) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="container">
            <Link to="/admin/courses">&larr; Back to Course List</Link>
            <h2>Manage Content for: {course?.title}</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                {/* Add Video Form */}
                <div style={{ flex: 1 }}>
                    <h3>Add New Video</h3>
                    <form onSubmit={handleVideoSubmit}>
                        <div>
                            <label>Video Title:</label>
                            <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
                        </div>
                        <div>
                            {/* --- START: INPUT FIELD MEIN BADLAV --- */}
                            <label>YouTube URL or Video ID:</label>
                            <input type="text" value={videoIdInput} onChange={(e) => setVideoIdInput(e.target.value)} required />
                            <small>You can paste the full YouTube URL or just the video ID.</small>
                            {/* --- END: INPUT FIELD MEIN BADLAV --- */}
                        </div>
                        <button type="submit">Add Video</button>
                    </form>
                </div>

                {/* Add Note Form */}
                <div style={{ flex: 1 }}>
                    <h3>Add New Note</h3>
                    <form onSubmit={handleNoteSubmit}>
                        <div>
                            <label>Note Title:</label>
                            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label>Content (Markdown supported):</label>
                            <textarea rows="4" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} required />
                        </div>
                        <button type="submit">Add Note</button>
                    </form>
                </div>
            </div>

            <hr style={{ margin: '2rem 0' }}/>

            {/* Existing Content Lists */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <h3>Existing Videos ({course?.youtubeVideos?.length || 0})</h3>
                    <ul>
                        {course?.youtubeVideos?.map(video => (
                            <li key={video._id}>{video.title} (ID: {video.videoId})</li>
                        ))}
                    </ul>
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Existing Notes ({course?.notes?.length || 0})</h3>
                    <ul>
                        {course?.notes?.map(note => (
                            <li key={note._id}>{note.title}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseContentManagementPage;