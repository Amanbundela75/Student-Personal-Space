const express = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/')
    .get(getAllCourses) // Public (can be filtered by query param ?branchId=...)
    .post(protect, authorize('admin'), createCourse); // Admin only

router.route('/:id')
    .get(getCourseById) // Public
    .put(protect, authorize('admin'), updateCourse) // Admin only
    .delete(protect, authorize('admin'), deleteCourse); // Admin only

module.exports = router;