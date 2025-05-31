import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { updateEnrollmentProgressApi, unenrollFromCourseApi } from '../../api/enrollments';


const EnrolledCourseCard = ({ enrollment, onUnenrollSuccess }) => {
    const { token } = useAuth();
    const [progress, setProgress] = useState(enrollment.progress || 0);
    const [isEditingProgress, setIsEditingProgress] = useState(false);
    const [newProgress, setNewProgress] = useState(enrollment.progress || 0);

    const handleProgressUpdate = async () => {
        if (newProgress < 0 || newProgress > 100) {
            alert("Progress must be between 0 and 100.");
            return;
        }
        try {
            const response = await updateEnrollmentProgressApi(enrollment._id, parseInt(newProgress, 10), token);
            if (response.success) {
                setProgress(response.data.progress);
                alert("Progress updated successfully!");
                setIsEditingProgress(false);
            } else {
                alert(`Failed to update progress: ${response.message}`);
            }
        } catch (error) {
            alert(`Error updating progress: ${error.response?.data?.message || error.message}`);
        }
    };

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
        return <div className="card"><p>Course data not available for this enrollment.</p></div>;
    }

    return (
        <div className="card">
            <h3>{enrollment.course.title}</h3>
            <p>{enrollment.course.description?.substring(0, 100)}...</p>
            {enrollment.course.branch && <p><strong>Branch:</strong> {enrollment.course.branch.name}</p>}
            <p><strong>Enrolled on:</strong> {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
            <p><strong>Current Progress:</strong> {progress}%</p>

            {isEditingProgress ? (
                <div>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={newProgress}
                        onChange={(e) => setNewProgress(e.target.value)}
                        style={{ width: '60px', marginRight: '10px' }}
                    />
                    <button onClick={handleProgressUpdate} className="action-button" style={{marginRight: "5px"}}>Save</button>
                    <button onClick={() => setIsEditingProgress(false)} className="action-button delete-button">Cancel</button>
                </div>
            ) : (
                <button onClick={() => setIsEditingProgress(true)} className="action-button edit-button" style={{marginRight: "10px"}}>Update Progress</button>
            )}
            {/* Basic "Start Studying" link - in a real LMS, this would go to course content */}
            <Link to={`/courses/${enrollment.course._id}/study`} className="action-button" style={{marginRight: "10px"}}>Start Studying</Link>
            <button onClick={handleUnenroll} className="action-button delete-button">Unenroll</button>
        </div>
    );
};

export default EnrolledCourseCard;