const express = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideoToCourse,
    addNoteToCourse,
    // === START: Naya function import karein ===
    getEnrolledCourses
    // === END: Naya function import karein ===
} = require('../controllers/courseController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Route for getting all courses and creating a new one
router.route('/')
    .get(getAllCourses) // Public (can be filtered by query param ?branchId=...)
    .post(protect, authorize('admin'), createCourse); // Admin only

// =================================================================
// === START: Naya route student ke enrolled courses ke liye     ===
// =================================================================
// IMPORTANT: Yeh route '/:id' se pehle aana chahiye
router.route('/my-courses')
    .get(protect, authorize('student'), getEnrolledCourses); // Students only
// =================================================================
// === END: Naya route                                           ===
// =================================================================

// Route for a single course by its ID
router.route('/:id')
    .get(getCourseById) // Public
    .put(protect, authorize('admin'), updateCourse) // Admin only
    .delete(protect, authorize('admin'), deleteCourse); // Admin only

// Route to add a video to a specific course
router.route('/:id/videos')
    .post(protect, authorize('admin'), addVideoToCourse); // Admin only

// Route to add a note to a specific course
router.route('/:id/notes')
    .post(protect, authorize('admin'), addNoteToCourse); // Admin only

module.exports = router;