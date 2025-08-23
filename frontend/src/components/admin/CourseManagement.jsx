import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses.js';
import { fetchBranches } from '../../api/branches.js';
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
        branchId: '',
        instructor: '',
    });

    const { token } = useAuth();
    const navigate = useNavigate();

    const loadCoursesAndBranches = async () => {
        setIsLoading(true);
        setError('');
        try {
            const coursesData = await fetchCourses();
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
        setCurrentCourse(prev => ({ ...prev, [name]: value }));
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
            const payload = {
                title: currentCourse.title,
                description: currentCourse.description,
                branchId: currentCourse.branchId,
                instructor: currentCourse.instructor,
            };
            if (isEditing) {
                await updateCourse(currentCourse._id, payload, token);
                setSuccess("Course updated successfully!");
            } else {
                await createCourse(payload, token);
                setSuccess("Course created successfully!");
            }
            loadCoursesAndBranches();
            resetForm();
        } catch (err)
        {
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
            branchId: course.branch._id,
            instructor: course.instructor || '',
        });
        window.scrollTo(0, 0); // Scroll to top to see the form
        setError('');
        setSuccess('');
    };

    const handleDelete = async (courseId, courseTitle) => {
        if (window.confirm(`Are you sure you want to delete course "${courseTitle}"?`)) {
            setIsLoading(true);
            setError('');
            try {
                await deleteCourse(courseId, token);
                setSuccess("Course deleted successfully!");
                loadCoursesAndBranches();
                resetForm();
            } catch (err) {
                console.error("Delete course error:", err);
                setError(err.response?.data?.message || err.message || "Error deleting course.");
            }
            setIsLoading(false);
        }
    };

    const handleManageContent = (courseId) => {
        navigate(`/admin/course/${courseId}/content`);
    };

    return (
        <div>
            <h3>{isEditing ? 'Edit Course' : 'Create New Course'}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                {/* Form fields remain the same */}
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

            <h3 style={{ marginTop: '2rem' }}>Existing Courses</h3>
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
                                {/* --- START: BADLAV YAHAN KIYE GAYE HAIN --- */}
                                <button onClick={() => handleEdit(course)} className="action-button edit-button" disabled={isLoading}>Edit</button>
                                <button onClick={() => handleDelete(course._id, course.title)} className="action-button delete-button" style={{ marginLeft: '5px' }} disabled={isLoading}>Delete</button>
                                <button onClick={() => handleManageContent(course._id)} className="action-button edit-button" style={{ marginLeft: '5px' }} disabled={isLoading}>
                                    Manage Content
                                </button>
                                {/* --- END: BADLAV YAHAN KIYE GAYE HAIN --- */}
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