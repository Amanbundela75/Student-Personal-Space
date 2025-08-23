import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';
import { setupInterceptors } from '../api/apiClient.js';

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('lms_user');
        setCurrentUser(null);
    };

    useEffect(() => {
        setupInterceptors(logout);
    }, []);

    useEffect(() => {
        const userDetails = localStorage.getItem('lms_user');
        if (userDetails) {
            try {
                const parsedDetails = JSON.parse(userDetails);
                if (parsedDetails.token) {
                    setCurrentUser(parsedDetails);
                } else {
                    logout();
                }
            } catch (e) {
                console.error("Failed to parse user details from localStorage", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

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

    const register = async (registrationData) => {
        try {
            const response = await authApi.register(registrationData);
            if (response.success) {
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Registration failed.' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'An unexpected error occurred during registration.' };
        }
    };

    // === NEW VALUES ADDED FOR EASIER ACCESS ===
    const isStudent = currentUser?.user?.role === 'student';
    // Handles both populated (object) and unpopulated (string ID) branch data
    const studentBranchId = currentUser?.user?.branch?._id || currentUser?.user?.branch || null;

    const value = {
        currentUser,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.user?.role === 'admin',
        token: currentUser?.token,
        isStudent, // <-- Student status direct available
        studentBranchId, // <-- Student ki branch ID direct available
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};