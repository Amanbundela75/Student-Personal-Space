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
    getAllStudentResults, // <-- NAYA ADMIN FUNCTION IMPORT KIYA GAYA
} = require('../controllers/TestController');

// Step 2: Security ke liye middleware import karein
const { protect, admin } = require('../middleware/authMiddleware.js');


// --- Routes ki Final List (Sahi Order Mein) ---

// --- ADMIN ROUTES ---
router.route('/')
    .get(protect, admin, getAllTests) // Sabhi tests laayein (Admin ke liye)
    .post(protect, admin, createTest); // Naya test banayein (Admin ke liye)

// --- START: NAYA ADMIN ROUTE ADD KIYA GAYA ---
// GET -> Admin sabhi students ke results dekhega
router.route('/all-results')
    .get(protect, admin, getAllStudentResults);
// --- END: NAYA ADMIN ROUTE ADD KIYA GAYA ---


// --- STUDENT ROUTES ---
// Specific routes hamesha dynamic routes (jaise /:id) se pehle aane chahiye.

// GET -> Ek course ke saare available tests laayein
router.route('/course/:courseId')
    .get(protect, getTestsForCourse);

// POST -> Student test submit karega
router.route('/submit')
    .post(protect, submitTest);

// GET -> Student apne saare purane results dekhega
router.route('/results')
    .get(protect, getTestResults);

// GET -> Student ek single result ki details dekhega (ID se)
router.route('/results/:id')
    .get(protect, getSingleTestResult);


// --- DYNAMIC ROUTE (YEH HAMESHA AAKHIR MEIN HONA CHAHIYE) ---
// Kyunki yeh route bahut general hai, isko sabse neeche rakha jaata hai.
router.route('/:id')
    .get(protect, getTestById)      // Ek specific test laayein ID se
    .put(protect, admin, updateTest)    // Test update karein (Admin ke liye)
    .delete(protect, admin, deleteTest); // Test delete karein (Admin ke liye)


module.exports = router;