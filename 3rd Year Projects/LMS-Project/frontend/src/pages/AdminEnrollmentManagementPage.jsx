import React, { useEffect, useState } from 'react';
import { fetchAllEnrollmentsAdmin } from '../api/enrollments.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

const AdminEnrollmentManagementPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const loadEnrollments = async () => {
            if (token) {
                setLoading(true);
                try {
                    const data = await fetchAllEnrollmentsAdmin(token);
                    setEnrollments(data || []);
                    setError('');
                } catch (err) {
                    setError('Failed to load enrollments.');
                    console.error(err);
                }
                setLoading(false);
            }
        };
        loadEnrollments();
    }, [token]);

    if (loading) return <p>Loading enrollments...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="container">
            <h2>All Student Enrollments</h2>
            {enrollments.length === 0 ? <p>No enrollments found.</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Course Title</th>
                        <th>Enrolled On</th>
                        <th>Progress</th>
                        {/* <th>Actions</th> */}
                    </tr>
                    </thead>
                    <tbody>
                    {enrollments.map(enrollment => (
                        <tr key={enrollment._id}>
                            <td>{enrollment.user ? `${enrollment.user.firstName} ${enrollment.user.lastName}` : 'N/A'}</td>
                            <td>{enrollment.user ? enrollment.user.email : 'N/A'}</td>
                            <td>{enrollment.course ? enrollment.course.title : 'N/A'}</td>
                            <td>{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                            <td>{enrollment.progress}%</td>
                            {/* Admin could have actions like view details, edit progress, or unenroll user */}
                            {/*<td> <Link to={`/admin/enrollments/${enrollment._id}`}>View</Link> </td>*/}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminEnrollmentManagementPage;