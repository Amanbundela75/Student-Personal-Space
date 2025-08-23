import apiClient from './axiosConfig';

// Fetch all branches
export const fetchBranches = async () => {
    try {
        const url = '/api/branches';
        const response = await apiClient.get(url);
        // FIX: The backend sends the array in the 'data' key, not 'branches'
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching branches:', error.response?.data || error.message);
        throw error; // Re-throw the error to be handled by the component
    }
};

// --- Admin Functions ---

// Fetch a single branch by its ID
export const fetchBranchById = async (id) => {
    const response = await apiClient.get(`/api/branches/${id}`);
    // This correctly expects the 'data' key for a single item
    return response.data.data;
};

// Create a new branch (sends token automatically via axios interceptor)
export const createBranch = async (branchData) => {
    const response = await apiClient.post('/api/branches', branchData);
    // Return the full response so the component can check `response.success`
    return response.data;
};

// Update an existing branch
export const updateBranch = async (id, branchData) => {
    const response = await apiClient.put(`/api/branches/${id}`, branchData);
    return response.data;
};

// Delete a branch
export const deleteBranch = async (id) => {
    const response = await apiClient.delete(`/api/branches/${id}`);
    return response.data;
};