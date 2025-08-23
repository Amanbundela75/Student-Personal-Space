import React, { useEffect, useState } from 'react';
import { fetchAllUsersAdmin, deleteUserByAdminApi } from '../../api/admin.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const loadUsers = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await fetchAllUsersAdmin(token);
            setUsers(fetchedUsers || []);
            setError('');
        } catch (err) {
            setError('Failed to load users.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) {
            loadUsers();
        }
    }, [token]);

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            try {
                const response = await deleteUserByAdminApi(userId, token);
                if (response.success) {
                    alert(response.message || "User deleted successfully.");
                    loadUsers(); // Refresh the list
                } else {
                    alert(`Failed to delete user: ${response.message}`);
                }
            } catch (err) {
                alert(`Error deleting user: ${err.response?.data?.message || err.message}`);
            }
        }
    };


    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            <h2>User Management</h2>
            {users.length === 0 ? <p>No users found.</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Last Login</th>
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
                            <td>{user.lastLoginTimestamp ? new Date(user.lastLoginTimestamp).toLocaleString() : 'Never'}</td>
                            <td>
                                <Link to={`/admin/users/${user._id}/edit`} className="action-button edit-button" style={{marginRight: '5px'}}>Edit</Link>
                                <button onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)} className="action-button delete-button">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserList;