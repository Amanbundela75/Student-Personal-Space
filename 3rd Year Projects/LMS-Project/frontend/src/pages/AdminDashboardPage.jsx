import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <p>Manage users, courses, branches, and view platform activity.</p>
            <div className="card-list" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'}}>
                <div className="card">
                    <h3>User Management</h3>
                    <p>View, edit, and manage all users.</p>
                    <Link to="/admin/users" className="button button-primary">Manage Users</Link>
                </div>
                <div className="card">
                    <h3>Branch Management</h3>
                    <p>Create, edit, and delete academic branches.</p>
                    <Link to="/admin/branches" className="button button-primary">Manage Branches</Link>
                </div>
                <div className="card">
                    <h3>Course Management</h3>
                    <p>Add new courses, update existing ones.</p>
                    <Link to="/admin/courses" className="button button-primary">Manage Courses</Link>
                </div>
                <div className="card">
                    <h3>Enrollment Overview</h3>
                    <p>View all student enrollments.</p>
                    <Link to="/admin/enrollments" className="button button-primary">View Enrollments</Link>
                </div>
                <div className="card">
                    <h3>Test Management</h3>
                    <p>Create, view, and manage all tests for courses.</p>
                    <Link to="/admin/tests" className="button button-primary">Manage Tests</Link>
                </div>
                {/* --- START: NAYA CARD JODA GAYA HAI --- */}
                <div className="card">
                    <h3>Student Results</h3>
                    <p>View all test results submitted by students.</p>
                    <Link to="/admin/results" className="button button-primary">View Results</Link>
                </div>
                {/* --- END: NAYA CARD JODA GAYA HAI --- */}
            </div>
        </div>
    );
};

export default AdminDashboardPage;