const express = require('express');
const router = express.Router();
const {
    createRoadmap,
    getAllRoadmaps,
    getRoadmapBySlug,
    updateRoadmap,
    deleteRoadmap,
} = require('../controllers/roadmapController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js'); // Multer middleware import karein

// Public routes
router.route('/').get(getAllRoadmaps);
router.route('/:slug').get(getRoadmapBySlug);

// Admin-only routes
// === MIDDLEWARE ADDED for file upload ===
router.route('/').post(protect, admin, upload.single('profileImage'), createRoadmap);
router.route('/:id')
    .put(protect, admin, upload.single('profileImage'), updateRoadmap)
    .delete(protect, admin, deleteRoadmap);

module.exports = router;