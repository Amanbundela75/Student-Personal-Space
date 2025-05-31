import React from 'react';
import { Link } from 'react-router-dom';
import MyCoursesPage from './MyCoursesPage.jsx'; // Re-using this page content for the dashboard

const StudentDashboardPage = () => {
    return (
        <div className="container">
            <h1>My Student Dashboard</h1>
            <p>Welcome back! Here are your enrolled courses and progress.</p>
            <div style={{ margin: "20px 0" }}>
                <Link to="/courses" className="button button-primary">Enroll in More Courses</Link>
            </div>
            <MyCoursesPage /> {/* Embed the enrolled courses list directly */}
        </div>
    );
};

export default StudentDashboardPage;