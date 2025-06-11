import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { enrollInCourseApi } from '../../api/enrollments.js';

const CourseCard = ({ course, onEnrollSuccess, isEnrolled }) => {
    const navigate = useNavigate();
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
                    navigate(`/courses/${course._id}/study`);
                } else {
                    alert(`Enrollment failed: ${response.message}`);
                }
            } catch (error) {
                alert(`Error enrolling: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    return (
    <div className="card course-item-card"> {/* एक और खास क्लास दे सकते हैं */}
        <div className="card-content"> {/* कंटेंट के लिए रैपर */}
            <h3>{course.title}</h3>
            <p>{course.description?.substring(0, 100)}...</p>
            {course.branch && <p><strong>Branch:</strong> {course.branch.name}</p>}
            <p><strong>Instructor:</strong> {course.instructor || 'N/A'}</p>
        </div>
        <div className="card-actions">
            <Link to={`/courses/${course._id}`} className="button button-primary">
                View Details
            </Link>
            {isAuthenticated && currentUser?.user?.role === 'student' && (
                isEnrolled ? (
                    <button className="button button-disabled" disabled>Already Enrolled</button>
                ) : (
                    <button onClick={handleEnroll} className="button button-primary">Enroll</button>
                    // Enroll को भी button-primary या अलग रंग दे सकते हैं, e.g., button-success (हरे रंग के लिए CSS बनानी होगी)
                )
            )}
        </div>
    </div>
    );
};

export default CourseCard;