const express = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideoToCourse,
    addNoteToCourse,
    getEnrolledCourses
} = require('../controllers/courseController.js');
const { protect, authorize, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/')
    .get(getAllCourses)
    .post(protect, admin, createCourse); // Changed authorize('admin') to admin for consistency

router.route('/my-courses')
    .get(protect, authorize('student'), getEnrolledCourses);

router.route('/:id')
    .get(getCourseById)
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

router.route('/:id/videos')
    .post(protect, admin, addVideoToCourse);

router.route('/:id/notes')
    .post(protect, admin, addNoteToCourse);

module.exports = router;