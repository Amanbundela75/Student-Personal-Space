import axios from 'axios';

// Ek naya axios instance banayein
const apiClient = axios.create({
    // Yahan aap apna base URL daal sakte hain, jaise /api
    baseURL: '/api',
});

// --- Interceptor Setup ---
// Yeh function AuthContext se logout function lega
export const setupInterceptors = (logoutUser) => {

    // 1. Request Interceptor: Har request ke saath token bhejne ke liye
    apiClient.interceptors.request.use(
        (config) => {
            const userDetails = localStorage.getItem('lms_user');
            if (userDetails) {
                const token = JSON.parse(userDetails).token;
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 2. Response Interceptor: 401 Unauthorized error ko pakadne ke liye
    apiClient.interceptors.response.use(
        // Agar response theek hai, to use waise hi jaane do
        (response) => response,
        // Agar error aata hai
        (error) => {
            // Check karein ki kya yeh 401 error hai
            if (error.response && error.response.status === 401) {
                console.error("Unauthorized! Logging out...");
                // AuthContext se mile logout function ko call karein
                logoutUser();
                // User ko login page par bhej dein
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

export default apiClient;