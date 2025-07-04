import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile } from "../api/profile.js";
import * as authApi from '../api/auth.js';

// --- BAS YAHAN 'export' ADD KIYA GAYA HAI ---
export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userDetails = localStorage.getItem('lms_user');
        if (userDetails) {
            try {
                const parsedDetails = JSON.parse(userDetails);
                // Set the user state first
                setCurrentUser(parsedDetails);

                // Then fetch the latest profile
                fetchUserProfile() // Token automatically lagega
                    .then(data => {
                        if (data.user) {
                            // Update user data, but keep the token from login
                            setCurrentUser(prev => ({ ...prev, user: data.user }));
                        }
                    })
                    .catch(() => {
                        // Agar profile fetch fail ho, to logout kar dein
                        localStorage.removeItem('lms_user');
                        setCurrentUser(null);
                    })
                    .finally(() => setLoading(false));
            } catch (e) {
                localStorage.removeItem('lms_user');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const register = async (formData) => {
        const response = await authApi.register(formData);
        return response;
    };

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

    const logout = () => {
        localStorage.removeItem('lms_user');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        loading,
        register,
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