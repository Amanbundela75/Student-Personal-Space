import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './StudentDashboardPage.css';

const StudentDashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // =======================================================
    //      YAHAN PAR ZAROORI BADLAV KIYA GAYA HAI
    // =======================================================

    // Data fetch karne ke logic ko ek alag function mein daal diya hai
    // isse hum isse baar-baar call kar sakte hain.
    const fetchUserProfile = useCallback(async () => {
        // Har baar fetch karne se pehle loading state set karein
        setLoading(true);
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

            const { data } = await axios.get('/api/users/profile', config);
            setUserData(data);
            setError(''); // Purana error saaf kar dein
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    }, []); // useCallback dependency array khaali rahega

    // Ye effect sirf pehli baar component load hone par chalega
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Ye naya effect tab chalega jab bhi aap is page par wapas aayengi
    useEffect(() => {
        // Jab user is window/tab par focus karega, to data refresh karo
        window.addEventListener('focus', fetchUserProfile);

        // Component ke hatne par is listener ko saaf karna zaroori hai
        return () => {
            window.removeEventListener('focus', fetchUserProfile);
        };
    }, [fetchUserProfile]);


    if (loading) {
        return <div className="loading-spinner">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // userData null ho to ek fallback UI dikhayein
    if (!userData) {
        return <div className="container"><p>No user data available.</p></div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome back, {userData.firstName}!</h1>
                <p>Here's a summary of your learning journey and enrolled courses.</p>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-card profile-summary">
                    <h3>Profile Summary</h3>
                    <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Joined On:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
                    {userData.branch && <p><strong>Branch:</strong> {userData.branch.name}</p>}
                    <Link to="/courses" className="button-explore">Explore More Courses</Link>
                </div>

                <div className="dashboard-card my-courses">
                    <h3>My Enrolled Courses ({userData.enrolledCourses?.length || 0})</h3>
                    {userData.enrolledCourses?.length > 0 ? (
                        <div className="course-list">
                            {userData.enrolledCourses.map(course => (
                                // Link ab course detail page par jayega
                                <Link to={`/courses/${course._id}`} key={course._id} className="course-item">
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