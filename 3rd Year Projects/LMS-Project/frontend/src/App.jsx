import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import PrivateRoute from './components/layout/PrivateRoute.jsx';

// --- (Saare imports jaise hain waise hi rahenge) ---
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BranchListPage from './pages/BranchListPage.jsx';
import CourseListPage from './pages/CourseListPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import StudentDashboardPage from './pages/StudentDashboardPage.jsx';
import MyCoursesPage from './pages/MyCoursesPage.jsx';
import StudyCoursePage from './pages/StudyCoursePage.jsx';
import AvailableTests from './pages/AvailableTests.jsx';
import TestAttemptPage from './pages/TestAttemptPage.jsx';
import MyResultsPage from './pages/MyResultsPage.jsx';
import ResultDetailPage from './pages/ResultDetailPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminUserManagementPage from './pages/AdminUserManagementPage.jsx';
import AdminBranchManagementPage from './pages/AdminBranchManagementPage.jsx';
import AdminCourseManagementPage from './pages/AdminCourseManagementPage.jsx';
import AdminEnrollmentManagementPage from './pages/AdminEnrollmentManagementPage.jsx';
import TestManagementPage from './pages/TestManagementPage.jsx';
import CreateTestPage from './pages/CreateTestPage.jsx';
import AdminAllResultsPage from './pages/AdminAllResultsPage.jsx';
import CourseContentManagementPage from './pages/CourseContentManagementPage.jsx';

function App() {
    return (
        <div className="app-container">
            <Navbar />
            <main>
                <Routes>
                    {/* Saare Routes jaise the waise hi rahenge */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/branches" element={<BranchListPage />} />
                    <Route path="/courses" element={<CourseListPage />} />
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                    <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                    <Route element={<PrivateRoute roles={['student', 'admin']} />}>
                        <Route path="/results/:resultId" element={<ResultDetailPage />} />
                    </Route>
                    <Route element={<PrivateRoute roles={['student']} />}>
                        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                        <Route path="/my-courses" element={<MyCoursesPage />} />
                        <Route path="/courses/:courseId/study" element={<StudyCoursePage />} />
                        <Route path="/course/:courseId/tests" element={<AvailableTests />} />
                        <Route path="/test/:testId/attempt" element={<TestAttemptPage />} />
                        <Route path="/my-results" element={<MyResultsPage />} />
                    </Route>
                    <Route element={<PrivateRoute roles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/users" element={<AdminUserManagementPage />} />
                        <Route path="/admin/branches" element={<AdminBranchManagementPage />} />
                        <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
                        <Route path="/admin/course/:courseId/content" element={<CourseContentManagementPage />} />
                        <Route path="/admin/enrollments" element={<AdminEnrollmentManagementPage />} />
                        <Route path="/admin/tests" element={<TestManagementPage />} />
                        <Route path="/admin/tests/create" element={<CreateTestPage />} />
                        <Route path="/admin/results" element={<AdminAllResultsPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;