import apiClient from './axiosConfig';

export const fetchCourses = async () => {
    try {
        const response = await apiClient.get('/api/courses');
        // 'response.data' ki jagah 'response.data.data' return karein
        return response.data.data;
    } catch (error) {
        console.error('Error fetching courses:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const fetchCourseById = async (id) => {
    try {
        const response = await apiClient.get(`/api/courses/${id}`);
        // 'response.data' ki jagah 'response.data.data' return karein
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching course ${id}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Admin functions waise hi rahenge...
export const createCourse = async (courseData) => {
    const response = await apiClient.post('/api/courses', courseData);
    return response.data;
};

export const updateCourse = async (id, courseData) => {
    const response = await apiClient.put(`/api/courses/${id}`, courseData);
    return response.data;
};

export const deleteCourse = async (id) => {
    const response = await apiClient.delete(`/api/courses/${id}`);
    return response.data;
};