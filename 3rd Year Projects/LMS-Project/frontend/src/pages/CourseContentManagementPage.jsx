import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    fetchCourseById,
    addVideoToCourse,
    addNoteToCourse,
    deleteVideoFromCourse, // Nayi API function
    deleteNoteFromCourse // Nayi API function
} from '../api/courses.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaTrash, FaYoutube, FaFilePdf } from 'react-icons/fa';
import './AdminManagementPage.css'; // Common styles

const CourseContentManagementPage = () => {
    const { courseId } = useParams();
    const { token } = useAuth();

    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [videoTitle, setVideoTitle] = useState('');
    const [videoIdInput, setVideoIdInput] = useState('');

    const [noteTitle, setNoteTitle] = useState('');
    const [noteFile, setNoteFile] = useState(null);

    const loadCourseDetails = async () => {
        try {
            const data = await fetchCourseById(courseId);
            setCourse(data); // Assuming API returns the full course object
        } catch (err) {
            setError('Failed to load course details.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(token) {
            loadCourseDetails();
        }
    }, [courseId, token]);

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        const extractedId = getYouTubeId(videoIdInput);

        if (!videoTitle || !extractedId) {
            setError('Please provide a video title and a valid YouTube URL or Video ID.');
            return;
        }
        setError(''); setSuccess('');
        try {
            const response = await addVideoToCourse(courseId, { title: videoTitle, videoId: extractedId }, token);
            setSuccess('Video added successfully!');
            setCourse(response.data);
            setVideoTitle('');
            setVideoIdInput('');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while adding the video.');
        }
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!noteTitle || !noteFile) {
            setError('Please provide both a note title and a file.');
            return;
        }
        setError(''); setSuccess('');

        const formData = new FormData();
        formData.append('title', noteTitle);
        formData.append('noteFile', noteFile);

        try {
            const response = await addNoteToCourse(courseId, formData, token);
            setSuccess('Note uploaded successfully!');
            setCourse(response.data);
            setNoteTitle('');
            setNoteFile(null);
            e.target.reset();
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while adding the note.');
        }
    };

    // === NEW DELETE FUNCTIONS START ===
    const handleDeleteVideo = async (videoId) => {
        if(window.confirm('Are you sure you want to delete this video?')) {
            try {
                const response = await deleteVideoFromCourse(courseId, videoId, token);
                setSuccess('Video deleted successfully!');
                setCourse(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete video.');
            }
        }
    };

    const handleDeleteNote = async (noteId) => {
        if(window.confirm('Are you sure you want to delete this note?')) {
            try {
                const response = await deleteNoteFromCourse(courseId, noteId, token);
                setSuccess('Note deleted successfully!');
                setCourse(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete note.');
            }
        }
    };
    // === NEW DELETE FUNCTIONS END ===

    if (isLoading) return <div className="admin-page-container"><p>Loading content details...</p></div>;
    if (!course) return <div className="admin-page-container"><p style={{ color: 'red' }}>{error || 'Could not load course.'}</p></div>;

    return (
        <div className="admin-page-container">
            <Link to="/admin/courses" className="back-link">&larr; Back to Course List</Link>
            <h1>Manage Content for: {course?.title}</h1>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="form-grid">
                {/* Add Video Form */}
                <div className="form-card">
                    <h2>Add New Video</h2>
                    <form onSubmit={handleVideoSubmit}>
                        <div className="form-group">
                            <label>Video Title</label>
                            <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>YouTube URL or Video ID</label>
                            <input type="text" value={videoIdInput} onChange={(e) => setVideoIdInput(e.target.value)} required />
                            <small>You can paste the full YouTube URL or just the video ID.</small>
                        </div>
                        <button type="submit" className="btn-submit">Add Video</button>
                    </form>
                </div>

                {/* Add Note Form */}
                <div className="form-card">
                    <h2>Add New Note (PDF, etc.)</h2>
                    <form onSubmit={handleNoteSubmit}>
                        <div className="form-group">
                            <label>Note Title</label>
                            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Upload Note File</label>
                            <input type="file" onChange={(e) => setNoteFile(e.target.files[0])} required accept=".pdf,.doc,.docx,.txt,.pptx" />
                        </div>
                        <button type="submit" className="btn-submit">Add Note</button>
                    </form>
                </div>
            </div>

            <div className="content-lists-grid">
                {/* Existing Videos List */}
                <div className="list-card">
                    <h2>Existing Videos ({course?.youtubeVideos?.length || 0})</h2>
                    <ul className="content-list">
                        {course?.youtubeVideos?.map(video => (
                            <li key={video._id}>
                                <FaYoutube className="content-icon video" />
                                <span>{video.title}</span>
                                <button className="btn-icon btn-danger" onClick={() => handleDeleteVideo(video._id)}><FaTrash /></button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Existing Notes List */}
                <div className="list-card">
                    <h2>Existing Notes ({course?.notes?.length || 0})</h2>
                    <ul className="content-list">
                        {course?.notes?.map(note => (
                            <li key={note._id}>
                                <FaFilePdf className="content-icon note" />
                                <a href={`http://localhost:5001${note.url}`} target="_blank" rel="noopener noreferrer">{note.title}</a>
                                <button className="btn-icon btn-danger" onClick={() => handleDeleteNote(note._id)}><FaTrash /></button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseContentManagementPage;