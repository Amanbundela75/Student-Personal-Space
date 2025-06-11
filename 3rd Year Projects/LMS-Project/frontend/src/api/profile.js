import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/auth'; // Profile routes are under /auth.js

export const fetchUserProfile = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data.user; // Assuming backend sends { success: true, user: ... }
};

export const updateUserProfileApi = async (profileData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/profile`, profileData, config);
    return response.data; // Assuming backend sends { success: true, user: ... }
};