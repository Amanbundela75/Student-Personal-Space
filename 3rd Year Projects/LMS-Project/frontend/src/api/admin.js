import apiClient from './axiosConfig';

// Admin User Management
export const fetchAllUsersAdmin = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.get(`/users`, config);
    return response.data.data;
};

export const fetchUserByIdAdmin = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.get(`/users/${userId}`, config);
    return response.data.data;
};

export const updateUserByAdminApi = async (userId, userData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.put(`/users/${userId}`, userData, config);
    return response.data;
};

export const deleteUserByAdminApi = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.delete(`/users/${userId}`, config);
    return response.data;
};