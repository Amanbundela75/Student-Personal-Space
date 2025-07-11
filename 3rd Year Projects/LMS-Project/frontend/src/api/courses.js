import apiClient from './axiosConfig';

// Fetch all courses, optionally filtered by branch
export const fetchCourses = async (branchId) => {
    try {
        // === SIRF YE SECTION BADLA GAYA HAI ===
        let url = '/api/courses';

        // Sirf tabhi branchId ko URL mein jodo jab woh sach mein ho
        if (branchId) {
            url += `?branchId=${branchId}`;
        }

        const response = await apiClient.get(url);
        // Poora { success, data } object return karein, taaki frontend use kar sake
        return response.data;
        // =====================================
    } catch (error) {
        console.error('Error fetching courses:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Fetch a single course by its ID
export const fetchCourseById = async (id) => {
    try {
        const response = await apiClient.get(`/api/courses/${id}`);
        // Backend se 'data' property return ho rahi hai
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching course ${id}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Create a new course (Admin)
export const createCourse = async (courseData) => {
    try {
        const response = await apiClient.post('/api/courses', courseData);
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Update an existing course (Admin)
export const updateCourse = async (id, courseData) => {
    try {
        const response = await apiClient.put(`/api/courses/${id}`, courseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating course ${id}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Delete a course (Admin)
export const deleteCourse = async (id) => {
    try {
        const response = await apiClient.delete(`/api/courses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting course ${id}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- START: NAYE FUNCTIONS CONTENT ADD KARNE KE LIYE ---

/**
 * Add a video to a specific course
 * @param {string} courseId - The ID of the course
 * @param {object} videoData - Object containing video details, e.g., { title, videoId }
 * @returns {Promise<object>}
 */
export const addVideoToCourse = async (courseId, videoData) => {
    try {
        const response = await apiClient.post(`/api/courses/${courseId}/videos`, videoData);
        return response.data;
    } catch (error) {
        console.error(`Error adding video to course ${courseId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Add a note to a specific course
 * @param {string} courseId - The ID of the course
 * @param {object} noteData - Object containing note details, e.g., { title, content, url }
 * @returns {Promise<object>}
 */
export const addNoteToCourse = async (courseId, noteData) => {
    try {
        const response = await apiClient.post(`/api/courses/${courseId}/notes`, noteData);
        return response.data;
    } catch (error) {
        console.error(`Error adding note to course ${courseId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- END: NAYE FUNCTIONS ---