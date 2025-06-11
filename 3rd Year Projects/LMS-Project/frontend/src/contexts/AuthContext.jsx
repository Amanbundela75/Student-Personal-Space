import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile } from "../api/profile.js";

// (1) --- API functions ko import karein ---
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile(token)
                .then(data => {
                    if (data.user) {
                        setCurrentUser({ token, user: data.user });
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('lms_user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password, faceImage) => {
        try {
            // (2) Imported function 'authApi.login' ko call karein
            const response = await authApi.login(email, password, faceImage);

            if (response.success && response.token) {
                localStorage.setItem('token', response.token);
                // lms_user ko bhi save kar sakte hain agar zaroorat ho
                localStorage.setItem('lms_user', JSON.stringify(response));
                setCurrentUser(response);
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error("Login error in context:", error);
            throw error;
        }
    };

    const register = async (formDataObject) => {
        // (3) Imported function 'authApi.register' ko call karein
        const response = await authApi.register(formDataObject);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('lms_user');
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.user?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};