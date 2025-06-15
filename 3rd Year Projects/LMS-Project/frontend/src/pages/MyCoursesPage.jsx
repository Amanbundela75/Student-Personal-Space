import React, { useState, useEffect } from 'react';
import { fetchMyEnrollments } from '../api/enrollments';
import { useAuth } from '../contexts/AuthContext.jsx';
import EnrolledCourseCard from '../components/student/EnrolledCourseCard.jsx';

const MyCoursesPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, currentUser } = useAuth(); // 'token' ki zaroorat nahi

    useEffect(() => {
        const loadEnrollments = async () => {
            // Sirf authenticated student ke liye data fetch karein
            if (isAuthenticated && currentUser?.user?.role === 'student') {
                setLoading(true);
                setError('');
                try {
                    // --- YAHAN BADLAAV KIYA GAYA HAI ---
                    // Ab 'response' seedha aapka data (array) hai
                    const enrollmentsData = await fetchMyEnrollments();
                    setEnrollments(enrollmentsData || []);

                } catch (err) {
                    setError('Failed to load your courses.');
                    console.error("Error in MyCoursesPage:", err);
                }
                setLoading(false);
            } else if (!isAuthenticated) {
                setError("Please log in to see your courses.");
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        loadEnrollments();
    }, [isAuthenticated, currentUser]); // Dependency array se 'token' hataya

    const handleUnenrollSuccess = (unenrolledCourseId) => {
        setEnrollments(prevEnrollments => prevEnrollments.filter(e => e._id !== unenrolledCourseId));
    };

    if (loading) return <p>Loading your courses...</p>;

    if (error) return <p style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>{error}</p>;

    return (
        <div className="container mt-4">
            <h2>My Courses</h2>
            {enrollments.length === 0 ? (
                <p>You are not enrolled in any courses yet. <a href="/courses">Browse courses</a> to get started!</p>
            ) : (
                <div className="row">
                    {enrollments.map(enrollment => (
                        <div className="col-md-4 mb-4" key={enrollment._id}>
                            <EnrolledCourseCard
                                enrollment={enrollment}
                                onUnenrollSuccess={handleUnenrollSuccess}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;