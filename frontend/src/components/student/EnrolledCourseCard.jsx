import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
// Sirf unenroll function import karenge, update wala hata denge
import { unenrollFromCourseApi } from '../../api/enrollments.js';

const EnrolledCourseCard = ({ enrollment, onUnenrollSuccess }) => {
    const { token } = useAuth();

    // Naye system se progress percentage calculate karenge
    const progressPercentage = useMemo(() => {
        if (!enrollment || !enrollment.course) return 0;

        const totalContent =
            (enrollment.course.youtubeVideos?.length || 0) +
            (enrollment.course.notes?.length || 0);

        if (totalContent === 0) return 0;

        const completedCount = enrollment.completedContent?.length || 0;

        return Math.round((completedCount / totalContent) * 100);
    }, [enrollment]);

    // Unenroll ka function waisa hi rahega
    const handleUnenroll = async () => {
        if (window.confirm(`Are you sure you want to unenroll from "${enrollment.course.title}"?`)) {
            try {
                const response = await unenrollFromCourseApi(enrollment._id, token);
                if (response.success) {
                    alert("Successfully unenrolled.");
                    if(onUnenrollSuccess) onUnenrollSuccess(enrollment._id);
                } else {
                    alert(`Failed to unenroll: ${response.message}`);
                }
            } catch (error) {
                alert(`Error unenrolling: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    if (!enrollment || !enrollment.course) {
        return (
            <div className="card h-100">
                <div className="card-body">
                    <p className="text-muted">Course data is not available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card enrolled-course-card">
            <div className="card-content">
                <h3>{enrollment.course.title}</h3>
                <p>Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>

                {/* Naya Progress Bar Section */}
                <div className="progress-section" style={{ marginTop: '15px' }}>
                    <p style={{ marginBottom: '5px' }}><strong>Progress: {progressPercentage}%</strong></p>
                    <div style={{
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        height: '10px'
                    }}>
                        <div style={{
                            width: `${progressPercentage}%`,
                            backgroundColor: '#27ae60',
                            borderRadius: '10px',
                            height: '100%'
                        }}></div>
                    </div>
                </div>
            </div>
            <div className="card-actions">
                {/* Link ka text "Go to Course" kar diya hai */}
                <Link to={`/courses/${enrollment.course._id}`} className="button button-primary">
                    Go to Course
                </Link>
                <button onClick={handleUnenroll} className="button button-danger">
                    Unenroll
                </button>
            </div>
        </div>
    );
};

export default EnrolledCourseCard;