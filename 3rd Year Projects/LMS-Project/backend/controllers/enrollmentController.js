const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment.js');
const Course = require('../models/Course.js');
require('../models/User.js');

// @desc    Enroll a student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
        res.status(400);
        throw new Error('Course ID is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
        res.status(400);
        throw new Error('You are already enrolled in this course');
    }

    const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
    });

    res.status(201).json(enrollment);
});

// @desc    Get enrollments for the logged-in student
// @route   GET /api/enrollments/my
// @access  Private (Student)
const getMyEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ user: req.user.id })
        .populate({
            path: 'course',
            select: 'title description branch instructor youtubeVideos notes',
            populate: {
                path: 'branch',
                select: 'name'
            }
        })
        .sort({ enrolledAt: -1 });

    res.status(200).json(enrollments);
});


// @desc    Mark a piece of course content as complete
// @route   POST /api/enrollments/:enrollmentId/complete
// @access  Private (Student)
const markContentAsComplete = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const { contentId } = req.body;
    const userId = req.user.id;

    const enrollment = await Enrollment.findById(enrollmentId).populate('course');
    if (!enrollment) {
        res.status(404);
        throw new Error('Enrollment not found.');
    }
    if (enrollment.user.toString() !== userId) {
        res.status(403);
        throw new Error('You are not authorized to update this enrollment.');
    }

    const allContentIds = [...enrollment.course.youtubeVideos.map(v => v._id.toString()), ...enrollment.course.notes.map(n => n._id.toString())];
    if (!allContentIds.includes(contentId)) {
        res.status(404);
        throw new Error('This content does not exist in this course.');
    }
    if (!enrollment.completedContent.includes(contentId)) {
        enrollment.completedContent.push(contentId);
        await enrollment.save();
    }
    res.status(200).json(enrollment);
});

// @desc    Mark a piece of course content as INCOMPLETE
// @route   POST /api/enrollments/:enrollmentId/incomplete
// @access  Private (Student)
const markContentAsIncomplete = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const { contentId } = req.body;
    const userId = req.user.id;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
        res.status(404);
        throw new Error('Enrollment not found.');
    }
    if (enrollment.user.toString() !== userId) {
        res.status(403);
        throw new Error('You are not authorized to update this enrollment.');
    }

    enrollment.completedContent = enrollment.completedContent.filter(id => id.toString() !== contentId);
    await enrollment.save();

    res.status(200).json(enrollment);
});

// @desc    Get all enrollments (Admin only)
// @route   GET /api/enrollments/all
// @access  Private (Admin)
const getAllEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({})
        .populate('user', 'firstName lastName email')
        .populate('course', 'title')
        .sort({ createdAt: -1 });

    res.status(200).json(enrollments);
});

// @desc    Get a single enrollment by ID (Admin only)
// @route   GET /api/enrollments/details/:id
// @access  Private (Admin)
const getEnrollmentByIdAdmin = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id)
        .populate('user', 'firstName lastName email role branch')
        .populate({
            path: 'course',
            populate: { path: 'branch', select: 'name' }
        });

    if (!enrollment) {
        res.status(404);
        throw new Error('Enrollment not found');
    }
    res.status(200).json(enrollment);
});


// @desc    Unenroll a student from a course
// @route   DELETE /api/enrollments/:id
// @access  Private (Student for own, Admin for any)
const deleteEnrollment = asyncHandler(async (req, res) => {
    const enrollmentId = req.params.id;
    const currentUser = req.user;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
        res.status(404);
        throw new Error('Enrollment not found.');
    }
    if (currentUser.role.toLowerCase() !== 'admin' && enrollment.user.toString() !== currentUser.id) {
        res.status(403);
        throw new Error('You are not authorized to perform this action.');
    }

    await enrollment.deleteOne();
    res.status(200).json({ message: 'Successfully unenrolled from the course.' });
});

// Sabhi functions ko ek saath export karein
module.exports = {
    enrollInCourse,
    getMyEnrollments,
    markContentAsComplete,
    markContentAsIncomplete,
    getAllEnrollments,
    getEnrollmentByIdAdmin,
    deleteEnrollment
};