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
    const { isAuthenticated, currentUser } = useAuth(); // 'token' ki zaroorat nahi

    const initialBranchId = query.get('branchId');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                // Branches fetch karein
                const branchesData = await fetchBranches();
                setBranches(branchesData || []);
                if (initialBranchId) {
                    setSelectedBranch(initialBranchId);
                }

                // Courses fetch karein
                const coursesData = await fetchCourses(initialBranchId);
                setCourses(coursesData || []);

                // Agar user logged in hai to uske enrollments fetch karein
                if (isAuthenticated && currentUser?.user?.role === 'student') {
                    const enrollmentsData = await fetchMyEnrollments();
                    const ids = new Set(enrollmentsData.map(e => e.course._id));
                    setEnrolledCourseIds(ids);
                }
            } catch (err) {
                setError('Failed to load course data. Please try again later.');
                console.error("Error loading course list data:", err);
            }
            setLoading(false);
        };

        loadInitialData();
    }, [initialBranchId, isAuthenticated, currentUser]); // Dependency se 'token' hataya


    const handleBranchChange = (e) => {
        const newBranchId = e.target.value;
        setSelectedBranch(newBranchId);
        // Branch change hone par sirf courses reload karein
        const loadCourses = async () => {
            setLoading(true);
            try {
                const coursesData = await fetchCourses(newBranchId);
                setCourses(coursesData || []);
            } catch (err) {
                setError('Failed to filter courses.');
            }
            setLoading(false);
        };
        loadCourses();
    };

    const handleEnrollSuccess = (enrolledCourseId) => {
        setEnrolledCourseIds(prevIds => new Set([...prevIds, enrolledCourseId]));
    };

    if (error) return <p style={{color: 'red'}}>{error}</p>;

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
                    <div className="row mt-4">
                        {courses.map(course => (
                            <div className="col-md-4 mb-4" key={course._id}>
                                <CourseCard
                                    course={course}
                                    onEnrollSuccess={handleEnrollSuccess}
                                    isEnrolled={enrolledCourseIds.has(course._id)}
                                />
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default CourseListPage;