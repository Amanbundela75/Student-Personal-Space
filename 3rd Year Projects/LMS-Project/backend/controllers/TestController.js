const Test = require('../models/Test.js');
const asyncHandler = require('../middleware/asyncHandler.js');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private/Admin
const getAllTests = asyncHandler(async (req, res) => {
    const tests = await Test.find({}).populate('course', 'title').populate('branch', 'name').sort({ createdAt: -1 });
    res.status(200).json(tests);
});

// @desc    Get a single test by its ID
// @route   GET /api/tests/:id
// @access  Private
const getTestById = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);
    if (test) {
        res.status(200).json(test);
    } else {
        res.status(404);
        throw new Error('Test not found with this ID');
    }
});

// @desc    Get all tests for a specific course
// @route   GET /api/tests/course/:courseId
// @access  Private
const getTestsForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const tests = await Test.find({ course: courseId });
    res.status(200).json(tests);
});

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = asyncHandler(async (req, res) => {
    const { title, course, branch, duration, questions } = req.body;

    // Behtar Validation
    if (!title || !course || !branch || !questions || questions.length === 0) {
        res.status(400);
        throw new Error('Please provide title, course, branch, and at least one question');
    }
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found.');
    }

    // --- YAHAN HAI ASLI FIX: DATA TRANSFORMATION ---
    // Frontend se aa rahe 'correctAnswer' (text) ko 'correctOption' (index) mein badlein
    const transformedQuestions = questions.map(q => {
        if (!q.correctAnswer || !q.options || !Array.isArray(q.options)) {
            throw new Error('Each question must have options and a correct answer.');
        }

        const correctOptionIndex = q.options.findIndex(opt => opt === q.correctAnswer);

        if (correctOptionIndex === -1) {
            // Agar frontend se aaya correctAnswer options mein hai hi nahi
            res.status(400);
            throw new Error(`The correct answer "${q.correctAnswer}" for question "${q.questionText}" is not valid.`);
        }

        return {
            questionText: q.questionText,
            options: q.options,
            correctOption: correctOptionIndex // Ab hum index bhej rahe hain, jo model ko chahiye
        };
    });

    // Ab naya test object banayein
    const test = new Test({
        title,
        course,
        branch,
        duration,
        questions: transformedQuestions, // Naye, transformed questions ka istemaal karein
        createdBy: req.user._id,
    });

    const createdTest = await test.save();
    res.status(201).json(createdTest);
});


// @desc    Update an existing test
// @route   PUT /api/tests/:id
// @access  Private/Admin
const updateTest = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);

    if (test) {
        test.title = req.body.title || test.title;
        test.course = req.body.course || test.course;
        test.branch = req.body.branch || test.branch;
        test.questions = req.body.questions || test.questions;
        test.duration = req.body.duration || test.duration;

        const updatedTest = await test.save();
        res.status(200).json(updatedTest);
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Delete a test
// @route   DELETE /api/tests/:id
// @access  Private/Admin
const deleteTest = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);

    if (test) {
        await test.deleteOne();
        res.status(200).json({ message: 'Test removed successfully' });
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

module.exports = {
    createTest,
    getAllTests,
    getTestById,
    getTestsForCourse,
    updateTest,
    deleteTest,
};