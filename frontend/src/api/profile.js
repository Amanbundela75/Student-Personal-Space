import apiClient from './axiosConfig';

// Dono functions mein token automatically lagega

export const fetchUserProfile = async () => {
    try {
        const response = await apiClient.get('/api/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateUserProfileApi = async (profileData) => {
    const response = await apiClient.put('/api/auth/profile', profileData);
    return response.data;
};