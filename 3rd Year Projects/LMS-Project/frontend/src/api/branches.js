import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/branches`; // Sahi URL

export const fetchBranches = async () => {
    try {
        const response = await axios.get(API_URL);
        // Backend ab 'data' key mein array bhejega.
        return response.data.branches;
    } catch (error) {
        console.error('Error fetching branches:', error.response?.data || error.message);
        throw error;
    }
};

// --- Baki functions (Admin ke liye) ---
export const fetchBranchById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
};

export const createBranch = async (branchData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, branchData, config);
    return response.data;
};

export const updateBranch = async (id, branchData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, branchData, config);
    return response.data;
};

export const deleteBranch = async (id, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};