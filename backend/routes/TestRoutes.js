const express = require('express');
const router = express.Router();

// Step 1: Controller se saare zaroori functions import karein
const {
    createTest,
    getAllTests,
    getTestById,
    updateTest,
    deleteTest,
    getTestsForCourse,
    submitTest,
    getTestResults,
    getSingleTestResult,
    getAllStudentResults,
    getMyResultsForCourse, // <-- Naya function import karein
} = require('../controllers/TestController');

// Step 2: Security ke liye middleware import karein
const { protect, admin } = require('../middleware/authMiddleware.js');


// --- Routes ki Final List (Sahi Order Mein) ---

// --- ADMIN ROUTES ---
router.route('/')
    .get(protect, admin, getAllTests) // Sabhi tests laayein (Admin ke liye)
    .post(protect, admin, createTest); // Naya test banayein (Admin ke liye)

router.route('/all-results')
    .get(protect, admin, getAllStudentResults);


// --- STUDENT ROUTES ---
router.route('/course/:courseId')
    .get(protect, getTestsForCourse);

router.route('/submit')
    .post(protect, submitTest);

// GET -> Student apne saare purane results dekhega (yeh /my-results se alag hai)
router.route('/results')
    .get(protect, getTestResults);

// GET -> Student ek single result ki details dekhega (ID se)
router.route('/results/:id')
    .get(protect, getSingleTestResult);

// === NAYA ROUTE YAHAN ADD KIYA GAYA HAI ===
// GET -> Ek particular course ke saare results laayein
router.route('/my-results/:courseId')
    .get(protect, getMyResultsForCourse);
// ===========================================

// --- DYNAMIC ROUTE (YEH HAMESHA AAKHIR MEIN HONA CHAHIYE) ---
router.route('/:id')
    .get(protect, getTestById)      // Ek specific test laayein ID se
    .put(protect, admin, updateTest)    // Test update karein (Admin ke liye)
    .delete(protect, admin, deleteTest); // Test delete karein (Admin ke liye)


module.exports = router;