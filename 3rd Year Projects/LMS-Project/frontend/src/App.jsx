import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import PrivateRoute from './components/layout/PrivateRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import StudentDashboardPage from './pages/StudentDashboardPage.jsx';
import MyCoursesPage from './pages/MyCoursesPage.jsx'; // For student's specific "My Courses" tab if needed

import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminUserManagementPage from './pages/AdminUserManagementPage.jsx';
import AdminBranchManagementPage from './pages/AdminBranchManagementPage.jsx';
import AdminCourseManagementPage from './pages/AdminCourseManagementPage.jsx';
import AdminEnrollmentManagementPage from './pages/AdminEnrollmentManagementPage.jsx';
// Placeholder for AdminEditUserPage - you would create this
// import AdminEditUserPage from './pages/AdminEditUserPage';


import BranchListPage from './pages/BranchListPage.jsx';
import CourseListPage from './pages/CourseListPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
// Placeholder for a page where students study course content
// import StudyCoursePage from './pages/StudyCoursePage';


import NotFoundPage from './pages/NotFoundPage.jsx';
import { useAuth } from './contexts/AuthContext.jsx';


function App() {
    const { isAuthenticated } = useAuth(); // Useful for conditional redirects at App level if needed

    return (
        <>
            <Navbar />
            <main> {/* Wrap routes in a main tag for semantics */}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/branches" element={<BranchListPage />} />
                    <Route path="/courses" element={<CourseListPage />} />
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />

                    {/* Routes for any logged-in user */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Student Routes */}
                    <Route element={<PrivateRoute roles={['student']} />}>
                        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                        <Route path="/my-courses" element={<MyCoursesPage />} />
                        {/* Example route for studying a course - implement StudyCoursePage */}
                        {/* <Route path="/courses/:courseId/study" element={<StudyCoursePage />} /> */}
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<PrivateRoute roles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/users" element={<AdminUserManagementPage />} />
                        {/* <Route path="/admin/users/:userId/edit" element={<AdminEditUserPage />} /> */}
                        <Route path="/admin/branches" element={<AdminBranchManagementPage />} />
                        <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
                        <Route path="/admin/enrollments" element={<AdminEnrollmentManagementPage />} />
                    </Route>

                    {/* Not Found Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;