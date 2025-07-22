const express = require('express');
const router = express.Router();
const { getPortfolio, updatePortfolio } = require('../controllers/portfolioController.js');
const { protect } = require('../middleware/authMiddleware.js'); // Auth middleware import

// Ye dono routes ek hi path ('/') par hain, isliye hum unhe chain kar sakte hain.
// 'protect' middleware yeh sunishchit karega ki sirf logged-in user hi in routes ko access kar sake.
router.route('/')
    .get(protect, getPortfolio)      // Apne portfolio ko get karne ke liye
    .put(protect, updatePortfolio);   // Apne portfolio ko update karne ke liye

module.exports = router;