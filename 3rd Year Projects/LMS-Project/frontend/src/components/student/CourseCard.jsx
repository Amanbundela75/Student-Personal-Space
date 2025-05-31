import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { enrollInCourseApi } from '../../api/enrollments';

const CourseCard = ({ course, onEnrollSuccess, isEnrolled }) => {
    const { token, isAuthenticated, currentUser } = useAuth();

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
                    if (onEnrollSuccess) onEnrollSuccess(course._id);
                } else {
                    alert(`Enrollment failed: ${response.message}`);
                }
            } catch (error) {
                alert(`Error enrolling: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    return (
        <div className="card">
            <h3>{course.title}</h3>
            <p>{course.description?.substring(0, 100)}...</p>
            {course.branch && <p><strong>Branch:</strong> {course.branch.name}</p>}
            <p><strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
            <Link to={`/courses/${course._id}`} className="action-button edit-button" style={{marginRight: "10px"}}>View Details</Link>
            {isAuthenticated && currentUser?.user?.role === 'student' && (
                isEnrolled ? (
                    <button disabled style={{backgroundColor: "grey"}}>Already Enrolled</button>
                ) : (
                    <button onClick={handleEnroll}>Enroll</button>
                )
            )}
        </div>
    );
};

export default CourseCard;