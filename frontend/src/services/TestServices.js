import apiClient from '../api/apiClient.js'; // axios ke bajaye apiClient ka upyog karein

// Naya test banane ke liye (Admin)
const createTest = async (testData) => {
    const response = await apiClient.post('/tests', testData);
    return response.data;
};

// Ek course ke saare tests laata hai
const getTestsForCourse = async (courseId) => {
    const response = await apiClient.get(`/tests/course/${courseId}`);
    return response.data;
};

// Ek single test ki poori details laata hai
const getTestById = async (testId) => {
    const response = await apiClient.get(`/tests/${testId}`);
    return response.data;
};

// Test ko submit karta hai
const submitTest = async (submissionData) => {
    const response = await apiClient.post('/tests/submit', submissionData);
    return response.data;
};

// Student ke saare purane results laata hai
const getMyResults = async () => {
    const response = await apiClient.get('/tests/results');
    return response.data;
};

// Ek single test result ki poori details laata hai
const getResultDetails = async (resultId) => {
    const response = await apiClient.get(`/tests/results/${resultId}`);
    return response.data;
};

const testService = {
    createTest,
    getTestsForCourse, // Humne iska naam getTests se getTestsForCourse kar diya hai, jo zyada saaf hai
    getTestById,
    submitTest,
    getMyResults,
    getResultDetails,
};

export default testService;