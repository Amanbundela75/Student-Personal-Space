// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js'); // (1) Multer middleware import karein

// @route   POST /api/auth.js/register
// Yahan par hum `upload.single('idCardImage')` ko as a middleware add karenge.
// Yeh multer ko batata hai ki 'idCardImage' naam ki field se ek file aayegi.
// Multer is file ko 'uploads/' folder mein save karega aur baki text fields ko req.body mein daal dega.
router.post('/register', upload.single('idCardImage'), authController.registerUser); // (2) Middleware yahan lagayein

// @route   POST /api/auth.js/login
router.post('/login', authController.loginUser);

// @route   GET /api/auth.js/verify-email/:token
router.get('/verify-email/:token', authController.verifyEmail);

// @route   GET /api/auth.js/profile
router.get('/profile', protect, authController.getUserProfile);

// @route   PUT /api/auth.js/profile
router.put('/profile', protect, authController.updateUserProfile);

// Admin routes (example)
// router.get('/users', protect, admin, adminController.getUsers);

module.exports = router;