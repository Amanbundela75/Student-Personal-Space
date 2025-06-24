import axios from 'axios';

// Backend API ka base URL
const API_URL = '/api/tests/';

/**
 * Naya test banane ke liye backend ko request bhejta hai.
 * @param {object} testData - Test ka data (title, questions, etc.)
 * @param {string} token - Admin ka authentication token
 */
const createTest = async (testData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Admin ko authenticate karne ke liye
        },
    };

    // POST request to '/api/tests/'
    const response = await axios.post(API_URL, testData, config);

    return response.data;
};

/**
 * Ek course ke saare tests laata hai.
 * @param {string} courseId - Course ki ID
 * @param {string} token - User ka authentication token
 */
const getTests = async (courseId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // GET request to '/api/tests/course/:courseId'
    const response = await axios.get(API_URL + 'course/' + courseId, config);

    return response.data;
};


const testService = {
    createTest,
    getTests,
};

export default testService;