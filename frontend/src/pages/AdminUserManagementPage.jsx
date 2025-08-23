import React from 'react';
import UserList from '../components/admin/UserList.jsx'; // Assuming UserList is comprehensive

const AdminUserManagementPage = () => {
    return (
        <div className="container">
            {/* You might have more components here like a form to create a new user by admin */}
            <UserList />
        </div>
    );
};
export default AdminUserManagementPage;