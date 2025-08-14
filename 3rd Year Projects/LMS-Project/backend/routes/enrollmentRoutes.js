const express = require('express');
const router = express.Router();

const {
    enrollInCourse,
    getMyEnrollments,
    markContentAsComplete,
    markContentAsIncomplete,
    getAllEnrollments,
    getEnrollmentByIdAdmin,
    deleteEnrollment
} = require('../controllers/enrollmentController.js');

const { protect, admin, authorize } = require('../middleware/authMiddleware.js');

// --- STUDENT ROUTES ---
router.route('/').post(protect, authorize('student'), enrollInCourse);
router.route('/my').get(protect, authorize('student'), getMyEnrollments);
router.route('/:enrollmentId/complete').post(protect, authorize('student'), markContentAsComplete);
router.route('/:enrollmentId/incomplete').post(protect, authorize('student'), markContentAsIncomplete);

// --- ADMIN ROUTES ---
router.route('/all').get(protect, admin, getAllEnrollments);
router.route('/details/:id').get(protect, admin, getEnrollmentByIdAdmin);

// --- COMMON ROUTES (STUDENT & ADMIN) ---
router.route('/:id').delete(protect, authorize('student', 'admin'), deleteEnrollment);

module.exports = router;