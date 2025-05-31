const express = require('express');
const {
    enrollInCourse,
    getMyEnrollments,
    updateEnrollmentProgress,
    getAllEnrollmentsAdmin,
    getEnrollmentByIdAdmin,
    unenrollFromCourse
} = require('../controllers/enrollmentController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Student routes
router.route('/')
    .post(protect, authorize('student'), enrollInCourse); // Student enrolls

router.route('/my')
    .get(protect, authorize('student'), getMyEnrollments); // Student gets their enrollments

router.route('/:id/progress')
    .put(protect, authorize('student'), updateEnrollmentProgress); // Student updates their progress

// This route needs careful placement to avoid conflict with '/:id' for admin
// Students can unenroll themselves
router.route('/:id')
    .delete(protect, authorize('student', 'admin'), unenrollFromCourse); // Student OR Admin can unenroll

// Admin routes for enrollments
router.route('/all') // Specific path for admin to get all enrollments
    .get(protect, authorize('admin'), getAllEnrollmentsAdmin);

router.route('/admin/:id') // Specific path prefix for admin to get specific enrollment by ID
    .get(protect, authorize('admin'), getEnrollmentByIdAdmin);
// Admin can also update any enrollment (e.g., progress, completion) or delete it.
// .put(protect, authorize('admin'), updateEnrollmentByAdmin) // Example: you'd create this controller
// .delete(protect, authorize('admin'), deleteEnrollmentByAdmin); // Covered by shared unenroll


module.exports = router;