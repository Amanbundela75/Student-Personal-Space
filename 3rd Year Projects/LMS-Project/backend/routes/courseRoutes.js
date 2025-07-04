const express = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    // --- START: Naye functions ko import karein ---
    addVideoToCourse,
    addNoteToCourse
    // --- END: Naye functions ko import karein ---
} = require('../controllers/courseController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Route for getting all courses and creating a new one
router.route('/')
    .get(getAllCourses) // Public (can be filtered by query param ?branchId=...)
    .post(protect, authorize('admin'), createCourse); // Admin only

// Route for a single course by its ID
router.route('/:id')
    .get(getCourseById) // Public
    .put(protect, authorize('admin'), updateCourse) // Admin only
    .delete(protect, authorize('admin'), deleteCourse); // Admin only

// --- START: Naye routes content add karne ke liye ---

// Route to add a video to a specific course
router.route('/:id/videos')
    .post(protect, authorize('admin'), addVideoToCourse); // Admin only

// Route to add a note to a specific course
router.route('/:id/notes')
    .post(protect, authorize('admin'), addNoteToCourse); // Admin only

// --- END: Naye routes content add karne ke liye ---

module.exports = router;