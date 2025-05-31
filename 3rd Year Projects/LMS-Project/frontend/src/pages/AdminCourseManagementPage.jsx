import React from 'react';
import CourseManagement from '../components/admin/CourseManagement.jsx'; // Import the new component

const AdminCourseManagementPage = () => {
    return (
        <div className="container">
            <h2>Course Management (Admin)</h2>
            <CourseManagement /> {/* Use the actual component here */}
        </div>
    );
};

export default AdminCourseManagementPage;