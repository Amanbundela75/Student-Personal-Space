import apiClient from './axiosConfig';

// Admin User Management
export const fetchAllUsersAdmin = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // FIX: URL ko '/api/users' kiya gaya hai
    const response = await apiClient.get(`/api/users`, config);
    // FIX: response.data se seedha data return karein, kyunki controller se poora users array aa raha hai
    return response.data;
};

export const fetchUserByIdAdmin = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // FIX: URL ko '/api/users/${userId}' kiya gaya hai
    const response = await apiClient.get(`/api/users/${userId}`, config);
    return response.data;
};

export const updateUserByAdminApi = async (userId, userData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // FIX: URL ko '/api/users/${userId}' kiya gaya hai
    const response = await apiClient.put(`/api/users/${userId}`, userData, config);
    return response.data;
};

export const deleteUserByAdminApi = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // FIX: URL ko '/api/users/${userId}' kiya gaya hai
    const response = await apiClient.delete(`/api/users/${userId}`, config);
    return response.data;
};