import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile } from "../api/profile.js";
import * as authApi from '../api/auth.js';
// --- Naya import ---
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

    // --- YEH NAYA useEffect ADD KIYA GAYA HAI ---
    // Yeh interceptor ko setup karega
    useEffect(() => {
        setupInterceptors(logout);
    }, []);

    useEffect(() => {
        const userDetails = localStorage.getItem('lms_user');
        if (userDetails) {
            try {
                const parsedDetails = JSON.parse(userDetails);
                setCurrentUser(parsedDetails);
                // Profile fetch karne ka logic waise hi rahega
            } catch (e) {
                localStorage.removeItem('lms_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, faceImage) => {
        const response = await authApi.login(email, password, faceImage);
        if (response.success && response.token) {
            localStorage.setItem('lms_user', JSON.stringify(response));
            setCurrentUser(response);
            return { success: true, user: response.user };
        } else {
            return { success: false, message: response.message };
        }
    };

    // register function waise hi rahega

    const value = {
        currentUser,
        loading,
        // register,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.user?.role === 'admin',
        token: currentUser?.token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};