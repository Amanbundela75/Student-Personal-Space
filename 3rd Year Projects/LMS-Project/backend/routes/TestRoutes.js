const express = require('express');
const router = express.Router();

// Step 1: Controller se saare zaroori functions import karein
// --- HUMNE 'getTestById' aur 'updateTest' KO ADD KIYA HAI ---
const {
    createTest,
    getAllTests,
    getTestById, // Yeh naya hai
    updateTest,  // Yeh naya hai
    deleteTest,
    getTestsForCourse,
} = require('../controllers/TestController');

// Step 2: Security ke liye middleware import karein
const { protect, admin } = require('../middleware/authMiddleware.js');


// --- Routes ki Final List ---

// Route for '/api/tests'
router.route('/')
    .get(protect, admin, getAllTests)    // GET -> Saare tests laayega (Sirf Admin)
    .post(protect, admin, createTest);   // POST -> Naya test banayega (Sirf Admin)

// Route for '/api/tests/course/:courseId'
router.route('/course/:courseId')
    .get(protect, getTestsForCourse); // GET -> Ek course ke tests laayega (Students ke liye)

// Route for '/api/tests/:id'
// --- HUMNE .get() aur .put() KO ADD KIYA HAI ---
router.route('/:id')
    .get(protect, getTestById)          // GET -> Ek test ki details laayega (ID se)
    .put(protect, admin, updateTest)    // PUT -> Test ko update karega (Sirf Admin)
    .delete(protect, admin, deleteTest); // DELETE -> Test ko delete karega (Sirf Admin)

module.exports = router;