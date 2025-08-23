import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const API_URL = 'http://localhost:5001/api';

const AdminEnrollmentManagementPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const fetchEnrollments = async () => {
        // Reset state before fetching
        setLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/enrollments/all`, config);
            setEnrollments(data);
        } catch (err) {
            setError('Failed to fetch enrollments.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) {
            fetchEnrollments();
        }
    }, [token]);

    const handleDelete = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to delete this enrollment permanently?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`${API_URL}/enrollments/${enrollmentId}`, config);
                // Refresh the list after successful deletion
                fetchEnrollments();
            } catch (err) {
                setError('Failed to delete enrollment.');
                console.error(err);
            }
        }
    };

    if (loading) return <div className="container"><p>Loading enrollments...</p></div>;
    if (error) return <div className="container"><p className="error-message" style={{color: 'red'}}>{error}</p></div>;

    return (
        <div className="container">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>All Student Enrollments</h1>

            {enrollments.length === 0 ? (
                <p>No enrollments found.</p>
            ) : (
                <table className="table">
                    <thead>
                    <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Course Title</th>
                        <th>Enrolled On</th>
                        <th>Progress</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {enrollments.map(enrollment => (
                        <tr key={enrollment._id}>
                            {/* === FIX START: 'enrollment.student' ko 'enrollment.user' kiya gaya === */}
                            <td>{enrollment.user ? `${enrollment.user.firstName} ${enrollment.user.lastName}` : 'N/A'}</td>
                            <td>{enrollment.user ? enrollment.user.email : 'N/A'}</td>
                            {/* ======================================================================= */}
                            <td>{enrollment.course ? enrollment.course.title : 'Course Deleted'}</td>
                            {/* === DATE FIX: Invalid Date se bachne ke liye check add kiya gaya === */}
                            <td>{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}</td>
                            {/* ===================================================================== */}
                            <td>0%</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(enrollment._id)}
                                    title="Delete Enrollment"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminEnrollmentManagementPage;