import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// fetchMyCourses function ko import karein
import { fetchCourses, fetchMyCourses } from '../api/courses.js';
import { fetchBranches } from '../api/branches.js';
import CourseCard from '../components/student/CourseCard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { currentUser, token } = useAuth();
    const query = useQuery();
    const initialBranchId = query.get('branchId');

    const isStudent = currentUser?.user?.role === 'student';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError('');
            try {
                if (isStudent) {
                    // --- STUDENT VIEW ---
                    // Sirf enrolled courses fetch karein
                    const myCoursesData = await fetchMyCourses(token);
                    setCourses(myCoursesData || []);
                } else {
                    // --- ADMIN / PUBLIC VIEW ---
                    // Saare branches aur courses fetch karein
                    const branchesData = await fetchBranches();
                    setBranches(branchesData || []);

                    if (initialBranchId) {
                        setSelectedBranch(initialBranchId);
                    }

                    const coursesResponse = await fetchCourses(initialBranchId);
                    setCourses(coursesResponse?.data || coursesResponse || []);
                }
            } catch (err) {
                setError('Failed to load course data. Please try again later.');
                console.error("Error loading course list data:", err);
            }
            setLoading(false);
        };

        // Token zaroori hai student ke courses fetch karne ke liye
        if (isStudent && !token) {
            setLoading(false);
            setError("You must be logged in to see your courses.");
            return;
        }

        loadData();
    }, [initialBranchId, isStudent, token]);


    const handleBranchChange = async (e) => {
        const newBranchId = e.target.value;
        setSelectedBranch(newBranchId);
        setLoading(true);
        try {
            const coursesResponse = await fetchCourses(newBranchId);
            setCourses(coursesResponse?.data || coursesResponse || []);
        } catch (err) {
            setError('Failed to filter courses.');
        }
        setLoading(false);
    };

    if (error) return <p style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>{error}</p>;

    return (
        <div className="container">
            {/* Title ko role ke hisaab se badlein */}
            <h1>{isStudent ? 'My Enrolled Courses' : 'Available Courses'}</h1>

            {/* Branch filter sirf non-students ko dikhayein */}
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
                    <p style={{textAlign: 'center', marginTop: '20px'}}>
                        {isStudent ? "You are not enrolled in any courses yet." : "No courses available for the selected criteria."}
                    </p>
                ) : (
                    <div className="courses-grid">
                        {courses.map(course => (
                            <div className="col-md-4 mb-4" key={course._id}>
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    // Student ke liye har course enrolled hi hoga
                                    isEnrolled={isStudent ? true : undefined}
                                    // Enroll button ki zaroorat nahi agar student view hai
                                    onEnrollSuccess={() => {}}
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