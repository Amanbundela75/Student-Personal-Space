// backend/routes/roadmapRoutes.js

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

// Public routes
router.route('/').get(getAllRoadmaps);
router.route('/:slug').get(getRoadmapBySlug);

// Admin-only routes
router.route('/').post(protect, admin, createRoadmap);
router.route('/:id').put(protect, admin, updateRoadmap).delete(protect, admin, deleteRoadmap);


module.exports = router;