import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/admin';

// Admin User Management
export const fetchAllUsersAdmin = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/users`, config);
    return response.data.data;
};

export const fetchUserByIdAdmin = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/users/${userId}`, config);
    return response.data.data;
};

export const updateUserByAdminApi = async (userId, userData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, config);
    return response.data;
};

export const deleteUserByAdminApi = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/users/${userId}`, config);
    return response.data;
};