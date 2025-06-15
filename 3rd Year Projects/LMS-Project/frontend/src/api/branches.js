import apiClient from './axiosConfig';

// --- YAHAN BADLAAV KIYA GAYA HAI ---
export const fetchBranches = async (branchId = '') => {
    try {
        // Agar branchId hai to use URL mein query parameter ke taur par bhejein
        const url = branchId ? `/api/branches?_id=${branchId}` : '/api/branches';
        const response = await apiClient.get(url);

        // Backend se 'branches' key expect kar rahe hain, isliye response.data.branches return karein
        // Agar response.data.branches undefined hai to khaali array return karein
        return response.data.branches || [];
    } catch (error) {
        console.error('Error fetching branches:', error.response?.data || error.message);
        throw error;
    }
};

// --- Baki functions (Admin ke liye) ---
// Inko bhi theek kar dete hain taaki yeh automatic token ka use karein

export const fetchBranchById = async (id) => {
    const response = await apiClient.get(`/api/branches/${id}`);
    return response.data.data;
};

export const createBranch = async (branchData) => {
    const response = await apiClient.post('/api/branches', branchData);
    return response.data;
};

export const updateBranch = async (id, branchData) => {
    const response = await apiClient.put(`/api/branches/${id}`, branchData);
    return response.data;
};

export const deleteBranch = async (id) => {
    const response = await apiClient.delete(`/api/branches/${id}`);
    return response.data;
};