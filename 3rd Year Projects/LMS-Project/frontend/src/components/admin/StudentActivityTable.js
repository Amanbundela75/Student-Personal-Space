// frontend/src/components/admin/StudentActivityTable.js
import React, { useEffect, useState } from 'react';
import { fetchAllUsersAdmin } from '../../api/admin.js'; // Assuming this fetches all users
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

const StudentActivityTable = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const loadUsers = async () => {
            if (!token) {
                setError("Authentication token not found. Please log in as admin.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const fetchedUsers = await fetchAllUsersAdmin(token);
                // Optionally filter for only 'student' roles if the table is strictly for students
                // const students = fetchedUsers.filter(user => user.role === 'student');
                // setUsers(students || []);
                setUsers(fetchedUsers || []); // Showing all users for now, admin can see other admins too
                setError('');
            } catch (err) {
                setError('Failed to load user data.');
                console.error(err);
            }
            setLoading(false);
        };

        loadUsers();
    }, [token]);

    if (loading) return <p>Loading student activity...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            <h2>Student Activity Overview</h2>
            {users.length === 0 ? <p>No users found.</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Last Login</th>
                        <th>Account Created</th>
                        {/* Add more relevant columns if available, e.g., isActiveNow if implemented */}
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.branch ? user.branch.name : 'N/A'}</td>
                            <td>
                                {user.lastLoginTimestamp
                                    ? new Date(user.lastLoginTimestamp).toLocaleString()
                                    : 'Never logged in'}
                            </td>
                            <td>
                                {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : 'N/A'}
                            </td>
                            <td>
                                <Link
                                    to={`/admin/users/${user._id}/edit`} // Assuming an edit page route exists
                                    className="action-button edit-button"
                                >
                                    View/Edit
                                </Link>
                                {/* Delete button can be added here if needed */}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StudentActivityTable;