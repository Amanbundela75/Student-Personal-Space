// frontend/src/api/auth.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/auth.js';

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        if (response.data.token) {
            localStorage.setItem('lms_user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response.data.message || 'Registration failed';
    }
};

export const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        if (response.data.token) {
            localStorage.setItem('lms_user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response.data.message || 'Login failed';
    }
};

export const logout = () => {
    localStorage.removeItem('lms_user');
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('lms_user'));
};

// You would also create api/branches.js, api/courses.js etc.
// Example: frontend/src/api/branches.js
// export const fetchBranches = async () => {
//     const response = await axios.get(`${process.env.REACT_APP_API_URL}/branches`);
//     return response.data;
// };