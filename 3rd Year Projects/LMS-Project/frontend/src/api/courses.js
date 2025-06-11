import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/courses';

// Public
export const fetchCourses = async (branchId = null) => {
    let url = API_URL;
    if (branchId) {
        url += `?branchId=${branchId}`;
    }
    const response = await axios.get(url);
    return response.data.data;
};

export const fetchCourseById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
};

// Admin
export const createCourse = async (courseData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, courseData, config);
    return response.data;
};

export const updateCourse = async (id, courseData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, courseData, config);
    return response.data;
};

export const deleteCourse = async (id, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};