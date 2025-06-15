import apiClient from './axiosConfig';

// =========== STUDENT ROUTES ===========
// In sabhi functions mein token automatically 'axiosConfig' se jud jayega

export const fetchMyEnrollments = async () => {
    try {
        const response = await apiClient.get('/api/enrollments/my');
        // Pichle error ko fix karne ke liye .data return karein
        return response.data.data;
    } catch (error) {
        console.error('Error fetching my enrollments:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const enrollInCourseApi = async (courseId) => {
    const response = await apiClient.post('/api/enrollments', { courseId });
    return response.data;
};

export const updateEnrollmentProgressApi = async (enrollmentId, progress) => {
    const response = await apiClient.put(`/api/enrollments/${enrollmentId}/progress`, { progress });
    return response.data;
};

export const unenrollFromCourseApi = async (enrollmentId) => {
    const response = await apiClient.delete(`/api/enrollments/${enrollmentId}`);
    return response.data;
};


// =========== ADMIN ROUTES ===========
// Yeh functions pichli baar miss ho gaye the

export const fetchAllEnrollmentsAdmin = async () => {
    try {
        const response = await apiClient.get('/api/enrollments/all');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching all enrollments for admin:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const fetchEnrollmentByIdAdmin = async (enrollmentId) => {
    try {
        const response = await apiClient.get(`/api/enrollments/admin/${enrollmentId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching enrollment ${enrollmentId} for admin:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};