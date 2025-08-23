import axios from 'axios';

const API_URL = 'http://localhost:5001/api/portfolio'; // Aapke backend ka URL

// Portfolio data get karne ke liye function
const getPortfolio = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Portfolio data update karne ke liye function
const updatePortfolio = async (portfolioData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(API_URL, portfolioData, config);
    return response.data;
};

const portfolioService = {
    getPortfolio,
    updatePortfolio,
};

export default portfolioService;