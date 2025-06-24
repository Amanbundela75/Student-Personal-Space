const Test = require('../models/Test.js');
const asyncHandler = require('../middleware/asyncHandler.js');
const testControllerPayload = require('../controllers/TestController');
console.log('testRoutes mein import hua hai:', testControllerPayload);

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private/Admin
const getAllTests = asyncHandler(async (req, res) => {
    // Database se saare tests fetch karein aur naye waale sabse upar rakhein
    const tests = await Test.find({}).sort({ createdAt: -1 });

    // FIX: Hum ab seedha tests ka array bhej rahe hain.
    // Frontend mein data handle karna ab aasan ho jaayega.
    res.status(200).json(tests);
});

// @desc    Get a single test by its ID
// @route   GET /api/tests/:id
// @access  Private
const getTestById = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);

    if (test) {
        // FIX: Yahan bhi, hum seedha test ka object bhej rahe hain.
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

    // FIX: Yahan bhi, seedha tests ka array bhejenge.
    res.status(200).json(tests);
});


// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = asyncHandler(async (req, res) => {
    // Basic validation
    const { title, course, questions } = req.body;
    if (!title || !course || !questions || questions.length === 0) {
        res.status(400); // Bad Request
        throw new Error('Please provide title, course, and at least one question');
    }

    const test = new Test({
        ...req.body,
        createdBy: req.user._id, // user object se _id lena behtar hai
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
        // Jo bhi fields update karni hain, unhe req.body se lein
        test.title = req.body.title || test.title;
        test.course = req.body.course || test.course;
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

console.log('TestController se export ho raha hai:', { getTestById });

module.exports = {
    createTest,
    getAllTests,
    getTestById,
    getTestsForCourse,
    updateTest,
    deleteTest,
}= testControllerPayload;
