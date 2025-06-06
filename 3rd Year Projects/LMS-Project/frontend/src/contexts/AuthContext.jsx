import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // For initial auth state check

    useEffect(() => {
        const storedUser = localStorage.getItem('lms_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setCurrentUser(userData);
            // Set axios default Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        if (response.data.success) {
            localStorage.setItem('lms_user', JSON.stringify(response.data));
            setCurrentUser(response.data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data; // Return full response for component to handle messages
    };

    const register = async (formDataObject) => {
        const response = await axios.post(`${API_URL}/register`, formDataObject);
        // Optionally auto-login or prompt user to login after successful registration
        // For now, just return the response
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('lms_user');
        setCurrentUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUserContext = (updatedUserData) => {
        // This function is called after a profile update to reflect changes in context
        const existingData = JSON.parse(localStorage.getItem('lms_user'));
        const newData = { ...existingData, user: updatedUserData.user }; // Assuming backend returns updated user nested
        localStorage.setItem('lms_user', JSON.stringify(newData));
        setCurrentUser(newData);
    };


    const value = {
        currentUser,
        login,
        register,
        logout,
        updateUserContext,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.user?.role === 'admin',
        userId: currentUser?.user?._id,
        token: currentUser?.token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};