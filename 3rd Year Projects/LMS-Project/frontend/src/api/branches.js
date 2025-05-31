import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/branches.js';

// Public
export const fetchBranches = async () => {
    const response = await axios.get(API_URL);
    return response.data.data; // Assuming backend sends { success: true, data: [...] }
};

export const fetchBranchById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
};

// Admin
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