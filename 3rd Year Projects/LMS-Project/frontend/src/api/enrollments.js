// FINAL AND COMPLETE CODE FOR enrollments.js
// Replace the entire content of your file with this.

// =================================================================
//      FOR STUDENTS
// =================================================================

// Function to get all enrollments for the logged-in student
export const fetchMyEnrollments = async (token) => {
    const response = await fetch('/api/enrollments/my', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch enrollments');
    return data.data;
};

// Function to enroll the current student in a course
export const enrollInCourseApi = async (courseId, token) => {
    const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ courseId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to enroll in course');
    return data;
};

// Function to unenroll a student from a course
export const unenrollFromCourseApi = async (enrollmentId, token) => {
    const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to unenroll');
    return data;
};

// Function to mark content as complete
export const markContentCompleteApi = async (enrollmentId, contentId, token) => {
    const response = await fetch(`/api/enrollments/${enrollmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ contentId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to mark as complete');
    return data;
};

// Function to mark content as incomplete
export const markContentIncompleteApi = async (enrollmentId, contentId, token) => {
    const response = await fetch(`/api/enrollments/${enrollmentId}/incomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ contentId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to mark as incomplete');
    return data;
};

// =================================================================
//      FOR ADMINS
// =================================================================

/**
 * Fetches all enrollments for the admin dashboard.
 * @param {string} token - The admin's authentication token.
 * @returns {Promise<Array>} - A list of all enrollments.
 */
export const fetchAllEnrollmentsAdmin = async (token) => {
    const response = await fetch('/api/enrollments', { // Admin GET request to the base route
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch all enrollments');
    }
    return data.data; // Assuming the API returns { success, data: [...] }
};