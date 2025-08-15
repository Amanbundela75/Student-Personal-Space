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
// === CHANGE HERE: Import the specific uploader for roadmap images ===
const { uploadRoadmapImage } = require('../middleware/uploadMiddleware.js');

// Public routes
router.route('/').get(getAllRoadmaps);
router.route('/:slug').get(getRoadmapBySlug);

// Admin-only routes
// === CHANGE HERE: Use the specific uploader in the routes ===
router.route('/').post(protect, admin, uploadRoadmapImage.single('profileImage'), createRoadmap);
router.route('/:id')
    .put(protect, admin, uploadRoadmapImage.single('profileImage'), updateRoadmap)
    .delete(protect, admin, deleteRoadmap);

module.exports = router;