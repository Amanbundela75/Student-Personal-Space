// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');
// === CHANGE HERE: Import the specific uploader for ID cards ===
const { uploadIdCard } = require('../middleware/uploadMiddleware.js');

// @route   POST /api/auth/register
// === CHANGE HERE: Use the specific uploader for ID cards ===
router.post('/register', uploadIdCard.single('idCardImage'), authController.registerUser);

// @route   POST /api/auth/login
router.post('/login', authController.loginUser);

// @route   GET /api/auth/verify-email/:token
router.get('/verify-email/:token', authController.verifyEmail);

// @route   GET /api/auth/profile
router.get('/profile', protect, authController.getUserProfile);

// @route   PUT /api/auth/profile
router.put('/profile', protect, authController.updateUserProfile);

module.exports = router;