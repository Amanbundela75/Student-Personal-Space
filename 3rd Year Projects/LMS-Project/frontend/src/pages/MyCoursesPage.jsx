import React, { useState, useEffect } from 'react';
import { fetchMyEnrollments } from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';
import EnrolledCourseCard from '../components/student/EnrolledCourseCard.jsx';

const MyCoursesPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, isAuthenticated, currentUser } = useAuth();

    const loadEnrollments = async () => {
        if (isAuthenticated && currentUser?.user?.role === 'student') {
            setLoading(true);
            setError('');
            try {
                const data = await fetchMyEnrollments(token);
                setEnrollments(data || []);
            } catch (err) {
                setError('Failed to load your courses.');
                console.error(err);
            }
            setLoading(false);
        } else {
            setLoading(false);
            setError("You must be logged in as a student to see your courses.");
        }
    };


    useEffect(() => {
        loadEnrollments();
    }, [isAuthenticated, token, currentUser]);

    const handleUnenrollSuccess = (unenrolledCourseId) => {
        setEnrollments(prevEnrollments => prevEnrollments.filter(e => e._id !== unenrolledCourseId));
    };

    if (loading) return <p>Loading your courses...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="container"> {/* Removed h1 as it might be part of StudentDashboardPage */}
            {enrollments.length === 0 ? (
                <p>You are not enrolled in any courses yet. <a href="/courses">Browse courses</a> to get started!</p>
            ) : (
                <div className="card-list">
                    {enrollments.map(enrollment => (
                        <EnrolledCourseCard
                            key={enrollment._id}
                            enrollment={enrollment}
                            onUnenrollSuccess={handleUnenrollSuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;