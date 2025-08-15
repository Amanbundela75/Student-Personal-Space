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
    const { isAuthenticated, token, isStudent, studentBranchId } = useAuth();
    const initialBranchIdFromUrl = query.get('branchId');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                let branchToFilter = '';
                if (isStudent) {
                    branchToFilter = studentBranchId;
                    setSelectedBranch(studentBranchId);
                } else {
                    branchToFilter = initialBranchIdFromUrl || '';
                    setSelectedBranch(branchToFilter);
                    const branchesResponse = await fetchBranches();
                    setBranches(branchesResponse.data || []);
                }

                // UPDATE: The API now always returns an object with a 'data' property
                const coursesResponse = await fetchCourses(branchToFilter);
                setCourses(coursesResponse.data || []);

                if (isStudent && token) {
                    const enrollmentsResponse = await fetchMyEnrollments(token);
                    // UPDATE: The enrollments API also returns an object with a 'data' property
                    const ids = new Set(enrollmentsResponse.data.map(e => e.course._id));
                    setEnrolledCourseIds(ids);
                }
            } catch (err) {
                setError('Failed to load course data. Please try again later.');
                console.error("Error loading course list data:", err);
            }
            setLoading(false);
        };

        loadInitialData();
    }, [initialBranchIdFromUrl, isAuthenticated, token, isStudent, studentBranchId]);

    const handleBranchChange = async (e) => {
        const newBranchId = e.target.value;
        setSelectedBranch(newBranchId);
        setLoading(true);
        try {
            const coursesResponse = await fetchCourses(newBranchId);
            setCourses(coursesResponse.data || []);
        } catch (err) {
            setError('Failed to filter courses.');
        }
        setLoading(false);
    };

    const handleEnrollSuccess = (enrolledCourseId) => {
        setEnrolledCourseIds(prevIds => new Set([...prevIds, enrolledCourseId]));
    };

    if (error) return <p style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>{error}</p>;

    return (
        <div className="container">
            <h1>Available Courses</h1>
            {!isStudent && (
                <div>
                    <label htmlFor="branchFilter" style={{ marginRight: '10px' }}>Filter by Branch:</label>
                    <select id="branchFilter" value={selectedBranch} onChange={handleBranchChange}>
                        <option value="">All Branches</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                </div>
            )}
            {loading ? <p style={{textAlign: 'center', marginTop: '20px'}}>Loading courses...</p> : (
                courses.length === 0 ? (
                    <p style={{textAlign: 'center', marginTop: '20px'}}>No courses available for the selected criteria.</p>
                ) : (
                    <div className="courses-grid">
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