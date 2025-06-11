import axios from 'axios';

// Backend ka base URL
const BASE_URL = import.meta.env.VITE_API_URL; // Yeh .env file se "http://localhost:5001" laayega

/**
 * User ko register karta hai
 */
export const register = async (formData) => {
    try {
        // SAHI URL: http://localhost:5001/api/auth/register
        // URL se '.js' hata diya gaya hai
        const response = await axios.post(`${BASE_URL}/api/auth/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('API Register Error:', error.response?.data || error.message);
        throw error.response?.data || { success: false, message: 'Server error during registration.' };
    }
};

/**
 * User ko login karta hai
 */
export const login = async (email, password, faceImageBase64) => {
    try {
        // SAHI URL: http://localhost:5001/api/auth/login
        // URL se '.js' hata diya gaya hai
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email,
            password,
            faceImageBase64,
        });
        return response.data;
    } catch (error) {
        console.error('API Login Error:', error.response?.data || error.message);
        throw error.response?.data || { success: false, message: 'Server error during login.' };
    }
};