import axios from 'axios';

// Submit feedback (student side)
export const submitFeedback = async (feedbackData) => {
    const response = await axios.post('/api/feedback', feedbackData);
    return response.data;
};

// Get all feedback (admin side)
export const getAllFeedback = async () => {
    const response = await axios.get('/api/feedback');
    return response.data;
};