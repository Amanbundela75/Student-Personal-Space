import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchCourses } from '../api/courses.js';
import { fetchBranches } from '../api/branches.js';
import { fetchMyEnrollments } from '../api/enrollments.js';
import CourseCard from '../components/student/CourseCard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const query = useQuery();
    const { isAuthenticated, token, currentUser } = useAuth();

    const initialBranchId = query.get('branchId');

    const loadCoursesAndEnrollments = async (branchFilter) => {
        setLoading(true);
        setError('');
        try {
            const coursesData = await fetchCourses(branchFilter);
            setCourses(coursesData || []);

            if (isAuthenticated && currentUser?.user?.role === 'student') {
                const enrollmentsData = await fetchMyEnrollments(token);
                const ids = new Set(enrollmentsData.map(e => e.course._id));
                setEnrolledCourseIds(ids);
            }
        } catch (err) {
            setError('Failed to load courses. Please try again later.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const branchesData = await fetchBranches();
                setBranches(branchesData || []);
                if (initialBranchId) {
                    setSelectedBranch(initialBranchId);
                }
            } catch (err) {
                console.error("Failed to load branches", err);
                setError("Could not load branch filter options.");
            }
            // Load courses based on initialBranchId or all if none
            loadCoursesAndEnrollments(initialBranchId);
        };
        loadInitialData();
    }, [initialBranchId, isAuthenticated, token, currentUser]); // Add dependencies

    const handleBranchChange = (e) => {
        const newBranchId = e.target.value;
        setSelectedBranch(newBranchId);
        loadCoursesAndEnrollments(newBranchId); // Reload courses for the new branch
    };

    const handleEnrollSuccess = (enrolledCourseId) => {
        setEnrolledCourseIds(prevIds => new Set([...prevIds, enrolledCourseId]));
    };

    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="container">
            <h1>Available Courses</h1>
            <div>
                <label htmlFor="branchFilter" style={{ marginRight: '10px' }}>Filter by Branch:</label>
                <select id="branchFilter" value={selectedBranch} onChange={handleBranchChange}>
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                </select>
            </div>

            {loading ? <p>Loading courses...</p> : (
                courses.length === 0 ? (
                    <p>No courses available for the selected criteria.</p>
                ) : (
                    <div className="card-list">
                        {courses.map(course => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                onEnrollSuccess={handleEnrollSuccess}
                                isEnrolled={enrolledCourseIds.has(course._id)}
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default CourseListPage;