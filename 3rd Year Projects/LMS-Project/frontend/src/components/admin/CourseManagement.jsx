import React, { useState, useEffect } from 'react';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses.js'; // Ensure .jsx if it contains JSX, or .js
import { fetchBranches } from '../../api/branches.js'; // Ensure .jsx if it contains JSX, or .js
import { useAuth } from '../../contexts/AuthContext.jsx';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({
        _id: '',
        title: '',
        description: '',
        branchId: '', // Changed from branch to branchId to match backend expectation
        instructor: '',
    });

    const { token } = useAuth();

    const loadCoursesAndBranches = async () => {
        setIsLoading(true);
        setError('');
        try {
            const coursesData = await fetchCourses(); // Fetches all courses
            const branchesData = await fetchBranches();
            setCourses(coursesData || []);
            setBranches(branchesData || []);
        } catch (err) {
            console.error("Failed to load courses or branches", err);
            setError(err.response?.data?.message || err.message || "Failed to load data.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (token) {
            loadCoursesAndBranches();
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCourse(prev => ({ ...prev,
            youtubeVideos: [
                { title: "Python Tutorial for Beginners", videoId: "https://youtu.be/ERCMXc8x7mc?si=N0JN7fQ16pJ7LZ3C" },
                { title: "Learn Python - Full Course", videoId: "https://youtu.be/UrsmFxEIp5k?si=GSGL5Vd-a7MS5XjN" }
            ],
            notes: [
                { title: "Note 1 Title", content: "Some text content for note 1..." },
                { title: "Note 2 Resource", url: "http://link.to/pdf" }
            ],
        }));
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentCourse({ _id: '', title: '', description: '', branchId: '', instructor: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentCourse.title || !currentCourse.description || !currentCourse.branchId) {
            setError("Title, description, and branch are required.");
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            let response;
            const payload = {
                title: currentCourse.title,
                description: currentCourse.description,
                branchId: currentCourse.branchId, // Ensure this matches backend expectation
                instructor: currentCourse.instructor,
            };
            if (isEditing) {
                response = await updateCourse(currentCourse._id, payload, token);
                setSuccess("Course updated successfully!");
            } else {
                response = await createCourse(payload, token);
                setSuccess("Course created successfully!");
            }
            if (response.success) {
                loadCoursesAndBranches();
                resetForm();
            } else {
                setError(response.message || "Operation failed.");
            }
        } catch (err) {
            console.error("Course operation error:", err);
            setError(err.response?.data?.message || err.message || "An error occurred.");
        }
        setIsLoading(false);
    };

    const handleEdit = (course) => {
        setIsEditing(true);
        setCurrentCourse({
            _id: course._id,
            title: course.title,
            description: course.description,
            branchId: course.branch._id, // Assuming course object has populated branch with _id
            instructor: course.instructor || '',
        });
        setError('');
        setSuccess('');
    };

    const handleDelete = async (courseId, courseTitle) => {
        if (window.confirm(`Are you sure you want to delete course "${courseTitle}"?`)) {
            setIsLoading(true);
            setError('');
            try {
                const response = await deleteCourse(courseId, token);
                if (response.success) {
                    setSuccess("Course deleted successfully!");
                    loadCoursesAndBranches();
                    resetForm();
                } else {
                    setError(response.message || "Failed to delete course.");
                }
            } catch (err) {
                console.error("Delete course error:", err);
                setError(err.response?.data?.message || err.message || "Error deleting course.");
            }
            setIsLoading(false);
        }
    };


    return (
        <div>
            <h3>{isEditing ? 'Edit Course' : 'Create New Course'}</h3>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input type="text" name="title" id="title" value={currentCourse.title} onChange={handleInputChange} required />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea name="description" id="description" value={currentCourse.description} onChange={handleInputChange} required />
                </div>
                <div>
                    <label htmlFor="branchId">Branch:</label>
                    <select name="branchId" id="branchId" value={currentCourse.branchId} onChange={handleInputChange} required>
                        <option value="">-- Select Branch --</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="instructor">Instructor (Optional):</label>
                    <input type="text" name="instructor" id="instructor" value={currentCourse.instructor} onChange={handleInputChange} />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}
                </button>
                {isEditing && <button type="button" onClick={resetForm} disabled={isLoading} style={{marginLeft: '10px', backgroundColor: 'grey'}}>Cancel Edit</button>}
            </form>

            <h3>Existing Courses</h3>
            {isLoading && courses.length === 0 && <p>Loading courses...</p>}
            {!isLoading && courses.length === 0 && <p>No courses found. Create one above!</p>}
            {courses.length > 0 && (
                <table>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Branch</th>
                        <th>Instructor</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map(course => (
                        <tr key={course._id}>
                            <td>{course.title}</td>
                            <td>{course.branch ? course.branch.name : 'N/A'}</td>
                            <td>{course.instructor || 'N/A'}</td>
                            <td>
                                <button onClick={() => handleEdit(course)} className="action-button edit-button" disabled={isLoading}>Edit</button>
                                <button onClick={() => handleDelete(course._id, course.title)} className="action-button delete-button" disabled={isLoading}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CourseManagement;