import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// MyCoursesPage ko import karne ki ab zaroorat nahi hai
import './StudentDashboardPage.css';

const StudentDashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const lmsUser = JSON.parse(localStorage.getItem('lms_user'));
                const token = lmsUser ? lmsUser.token : null;

                if (!token) {
                    setError('Authentication token not found. Please log in.');
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Yahi API call user ki profile aur uske courses, dono le aayegi
                const { data } = await axios.get('/api/users/profile', config);
                setUserData(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <div className="loading-spinner">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome back, {userData?.firstName}!</h1>
                <p>Here's a summary of your learning journey and enrolled courses.</p>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-card profile-summary">
                    <h3>Profile Summary</h3>
                    <p><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</p>
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Joined On:</strong> {new Date(userData?.createdAt).toLocaleDateString()}</p>
                    {userData?.branch && <p><strong>Branch:</strong> {userData.branch.name}</p>}
                    <Link to="/courses" className="button-explore">Explore More Courses</Link>
                </div>

                {/* === YAHAN BADA BADLAV KIYA GAYA HAI === */}
                <div className="dashboard-card my-courses">
                    <h3>My Enrolled Courses ({userData?.enrolledCourses?.length || 0})</h3>
                    {/* MyCoursesPage component ko hata diya gaya hai */}
                    {userData?.enrolledCourses?.length > 0 ? (
                        <div className="course-list">
                            {/* Ab data seedhe 'userData' se aa raha hai */}
                            {userData.enrolledCourses.map(course => (
                                <Link to={`/courses/${course._id}/study`} key={course._id} className="course-item">
                                    <img src={course.imageUrl || '/images/default-course.png'} alt={course.title} />
                                    <span>{course.title}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p>You haven't enrolled in any courses yet. <Link to="/courses">Explore Courses</Link></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardPage;