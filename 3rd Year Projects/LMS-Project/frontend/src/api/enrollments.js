import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/enrollments';

// Student
export const enrollInCourseApi = async (courseId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, { courseId }, config);
    return response.data;
};

export const fetchMyEnrollments = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/my`, config);
    return response.data.data;
};

export const updateEnrollmentProgressApi = async (enrollmentId, progress, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${enrollmentId}/progress`, { progress }, config);
    return response.data;
};

export const unenrollFromCourseApi = async (enrollmentId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${enrollmentId}`, config);
    return response.data;
}

// Admin
export const fetchAllEnrollmentsAdmin = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/all`, config);
    return response.data.data;
};

export const fetchEnrollmentByIdAdmin = async (enrollmentId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/admin/${enrollmentId}`, config); // Using the specific admin route
    return response.data.data;
};