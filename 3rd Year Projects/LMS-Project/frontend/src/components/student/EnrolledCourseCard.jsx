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
        return <div className="card"><p>Course data not available.</p></div>;
    }

    return (
        <div className="card enrolled-course-card"> {/* एक और खास क्लास दे सकते हैं */}
            <div className="card-content">
                <h3>{enrollment.course.title}</h3>
                {/* ... (बाकी कंटेंट: description, branch, enrolled on) ... */}
                <p><strong>Current Progress:</strong> {progress}%</p>
                {isEditingProgress ? (
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}> {/* प्रोग्रेस अपडेट के लिए फ्लेक्स */}
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={newProgress}
                            onChange={(e) => setNewProgress(e.target.value)}
                            style={{ width: '70px', padding: '8px' }}
                        />
                        <button onClick={handleProgressUpdate} className="button button-primary" style={{flexGrow: 1}}>Save</button>
                        <button onClick={() => setIsEditingProgress(false)} className="button button-secondary" style={{flexGrow: 1}}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditingProgress(true)} className="button button-edit" style={{width: '100%', marginTop: '10px'}}>Update Progress</button>
                )}
            </div>
            <div className="card-actions">
                <Link to={`/courses/${enrollment.course._id}/study`} className="button button-primary">
                    Start Studying
                </Link>
                <button onClick={handleUnenroll} className="button button-danger">
                    Unenroll
                </button>
            </div>
        </div>
    );
};

export default EnrolledCourseCard;