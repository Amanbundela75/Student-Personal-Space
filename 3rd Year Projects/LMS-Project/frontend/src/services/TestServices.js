import axios from 'axios';

// Backend API ka base URL
const API_URL = '/api/tests/';

/**
 * Naya test banane ke liye backend ko request bhejta hai. (Admin)
 * @param {object} testData - Test ka data (title, questions, etc.)
 * @param {string} token - Admin ka authentication token
 */
const createTest = async (testData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, testData, config);
    return response.data;
};

/**
 * Ek course ke saare tests laata hai. (Student)
 * @param {string} courseId - Course ki ID
 * @param {string} token - User ka authentication token
 */
const getTests = async (courseId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL + 'course/' + courseId, config);
    return response.data;
};

// =========================================================
// ===== STUDENT FUNCTIONALITY
// =========================================================

/**
 * Ek single test ki poori details laata hai (questions ke saath).
 * @param {string} testId - Test ki ID
 * @param {string} token - User ka authentication token
 */
const getTestById = async (testId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // GET request to '/api/tests/:id'
    const response = await axios.get(API_URL + testId, config);
    return response.data;
};

/**
 * Diye gaye answers ke saath test ko submit karta hai.
 * @param {object} submissionData - { testId, answers }
 * @param {string} token - User ka authentication token
 */
const submitTest = async (submissionData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // POST request to '/api/tests/submit'
    const response = await axios.post(API_URL + 'submit', submissionData, config);
    return response.data;
};

/**
 * Logged-in student ke saare purane results laata hai.
 * @param {string} token - User ka authentication token
 */
const getMyResults = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // GET request to '/api/tests/results'
    const response = await axios.get(API_URL + 'results', config);
    return response.data;
};

// --- START: NAYA FUNCTION ADD KIYA GAYA ---
/**
 * Ek single test result ki poori details laata hai.
 * @param {string} resultId - Result ki ID
 * @param {string} token - User ka authentication token
 */
const getResultDetails = async (resultId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // GET request to '/api/tests/results/:id'
    const response = await axios.get(API_URL + 'results/' + resultId, config);
    return response.data;
};
// --- END: NAYA FUNCTION ADD KIYA GAYA ---


// --- Updated export object ---
const testService = {
    createTest,
    getTests,
    getTestById,
    submitTest,
    getMyResults,
    getResultDetails, // <-- Naya function export kiya gaya
};

export default testService;