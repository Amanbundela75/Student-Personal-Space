import apiClient from './axiosConfig';

// Admin User Management
export const fetchAllUsersAdmin = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.get(`/api/users`, config);
    return response.data;
};

export const fetchUserByIdAdmin = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.get(`/api/users/${userId}`, config);
    return response.data;
};

export const updateUserByAdminApi = async (userId, userData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.put(`/api/users/${userId}`, userData, config);
    return response.data;
};

export const deleteUserByAdminApi = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.delete(`/api/users/${userId}`, config);
    return response.data;
};

// --- START: NAYA FUNCTION ADD KIYA GAYA ---

/**
 * Fetches all test results for all students.
 * @param {string} token - The admin's authentication token.
 * @returns {Promise<Array>} - A promise that resolves to an array of all results.
 */
export const getAllResultsAdmin = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await apiClient.get('/api/tests/all-results', config);
    return response.data;
};

// --- END: NAYA FUNCTION ADD KIYA GAYA ---