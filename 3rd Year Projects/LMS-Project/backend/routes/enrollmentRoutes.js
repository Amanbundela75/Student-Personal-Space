const express = require('express');
const {
    enrollInCourse,
    getMyEnrollments,
    // updateEnrollmentProgress, // <-- Ye ab use nahi ho raha hai
    getAllEnrollmentsAdmin,
    getEnrollmentByIdAdmin,
    unenrollFromCourse,
    markContentAsComplete,      // <-- Naya function import kiya
    markContentAsIncomplete     // <-- Naya function import kiya
} = require('../controllers/enrollmentController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// =================================================================
//                      STUDENT ROUTES
// =================================================================

// Student enrolls in a course
router.route('/')
    .post(protect, authorize('student'), enrollInCourse);

// Student gets their own list of enrolled courses
router.route('/my')
    .get(protect, authorize('student'), getMyEnrollments);

// Student marks content as complete
router.route('/:enrollmentId/complete')
    .post(protect, authorize('student'), markContentAsComplete);

// Student marks content as incomplete
router.route('/:enrollmentId/incomplete')
    .post(protect, authorize('student'), markContentAsIncomplete);

// Student or Admin can unenroll from a course
// Note: This route must be placed carefully to avoid conflicts with other /:id routes
router.route('/:id')
    .delete(protect, authorize('student', 'admin'), unenrollFromCourse);


// =================================================================
//                      ADMIN ROUTES
// =================================================================

// Admin gets a list of all enrollments in the system
router.route('/all')
    .get(protect, authorize('admin'), getAllEnrollmentsAdmin);

// Admin gets a single enrollment's details by its ID
// Using '/details/:id' to avoid any possible conflict with the '/:id' used for un-enrollment
router.route('/details/:id')
    .get(protect, authorize('admin'), getEnrollmentByIdAdmin);


// The old progress route has been removed.
// router.route('/:id/progress')
//     .put(protect, authorize('student'), updateEnrollmentProgress);


module.exports = router;