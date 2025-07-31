import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';
import { setupInterceptors } from '../api/apiClient.js'; // Axios interceptors ke liye

// Context create karna
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Logout function
    const logout = () => {
        localStorage.removeItem('lms_user');
        setCurrentUser(null);
        // Redirect logic can be handled in the component calling logout
    };

    // Axios interceptors ko setup karne ke liye
    // Yeh component mount hone par ek baar chalega
    useEffect(() => {
        // Interceptor ko logout function pass kiya ja raha hai
        // taaki token expire hone par automatically logout ho sake
        setupInterceptors(logout);
    }, []);

    // Check for user session on initial load
    useEffect(() => {
        const userDetails = localStorage.getItem('lms_user');
        if (userDetails) {
            try {
                const parsedDetails = JSON.parse(userDetails);
                if (parsedDetails.token) {
                    setCurrentUser(parsedDetails);
                } else {
                    // Agar data ajeeb hai ya token nahi hai
                    logout();
                }
            } catch (e) {
                console.error("Failed to parse user details from localStorage", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password, faceImage) => {
        try {
            const response = await authApi.login(email, password, faceImage);
            if (response.success && response.token) {
                localStorage.setItem('lms_user', JSON.stringify(response));
                setCurrentUser(response);
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message || "Login failed." };
            }
        } catch (error) {
            return { success: false, message: error.message || "An error occurred during login."};
        }
    };

    // --- YAHAN REGISTER FUNCTION ADD KIYA GAYA HAI ---
    const register = async (registrationData) => {
        try {
            // authApi se register function call karna
            const response = await authApi.register(registrationData);
            // API response ke hisab se handle karna
            if (response.success) {
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Registration failed.' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'An unexpected error occurred during registration.' };
        }
    };

    // Value object jo context provider ke through pass hoga
    const value = {
        currentUser,
        loading,
        register, // <<--- REGISTER FUNCTION AB AVAILABLE HAI
        login,
        logout,
        isAuthenticated: !!currentUser, // Yeh check karega ki user logged in hai ya nahi
        isAdmin: currentUser?.user?.role === 'admin', // Admin role check
        token: currentUser?.token, // Token ko alag se pass karna
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};