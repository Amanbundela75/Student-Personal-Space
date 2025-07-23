const Test = require('../models/Test.js');
const Result = require('../models/Result.js'); // Aapke code mein Result model ka naam TestAttempt ho sakta hai, use check karein
const asyncHandler = require('../middleware/asyncHandler.js');
const mongoose = require('mongoose');

// ... (baki functions jaise getAllTests, updateTest, deleteTest waise hi rahenge)

// @desc    Get a single test by its ID FOR A STUDENT (SAFE VERSION)
// @route   GET /api/tests/:id
// @access  Private
const getTestById = asyncHandler(async (req, res) => {
    // --- YEH FUNCTION PURI TARAH SE BADLA GAYA HAI ---
    // Hum sirf zaroori data bhejenge aur correctOption ko hata denge.
    const test = await Test.findById(req.params.id).select('-questions.correctOption');

    if (test) {
        res.status(200).json(test);
    } else {
        res.status(404);
        throw new Error('Test not found with this ID');
    }
});

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = asyncHandler(async (req, res) => {
    // --- isProctored ko yahan add kiya gaya hai ---
    const { title, course, branch, duration, questions, isProctored } = req.body;

    if (!title || !course || !branch || !questions || questions.length === 0) {
        res.status(400);
        throw new Error('Please provide title, course, branch, and at least one question');
    }

    // ... (transformedQuestions ka logic waisa hi rahega)
    const transformedQuestions = questions.map(q => {
        // ...
        return { /* ... */ };
    });

    const test = new Test({
        title,
        course,
        branch,
        duration,
        isProctored, // <-- YEH LINE ADD KI GAYI HAI
        questions: transformedQuestions,
        createdBy: req.user._id,
    });

    const createdTest = await test.save();
    res.status(201).json(createdTest);
});


// @desc    Submit a test and save the result
// @route   POST /api/tests/submit
// @access  Private (Student)
const submitTest = asyncHandler(async (req, res) => {
    // --- Yahan Result model ka naam check karein ---
    // Aapke purane code mein yeh Result tha, lekin TestAttempt.js file ke hisaab se TestAttempt hona chahiye.
    // Main yahan TestAttempt use kar raha hoon.
    const TestAttempt = require('../models/TestAttempt.js'); // Model ko yahan require karein

    const { testId, answers } = req.body;
    const studentId = req.user._id;

    const test = await Test.findById(testId);

    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    let score = 0;
    test.questions.forEach((question, index) => {
        const userAnswerIndex = answers[index];
        if (userAnswerIndex !== null && userAnswerIndex !== undefined && question.correctOption === userAnswerIndex) {
            score++;
        }
    });

    const attempt = await TestAttempt.create({
        student: studentId,
        test: testId,
        score: score,
        answers: answers, // answers array ko seedhe save karein
        submitted: true,
    });

    if (attempt) {
        res.status(201).json({
            success: true,
            message: "Test submitted successfully!",
            score: score,
            totalMarks: test.questions.length,
        });
    } else {
        res.status(400);
        throw new Error('Could not save the result');
    }
});


// Baki saare functions (getTestResults, getSingleTestResult, etc.) waise hi rahenge
// Lekin dhyan dein ki aap Result aur TestAttempt models ko aapas mein mix na karein.

// --- Updated module.exports ---
module.exports = {
    createTest,
    // getAllTests,
    getTestById,
    // getTestsForCourse,
    // updateTest,
    // deleteTest,
    submitTest,
    // getTestResults,
    // getSingleTestResult,
    // getAllStudentResults,
};