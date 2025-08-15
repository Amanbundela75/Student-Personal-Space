const asyncHandler = require('express-async-handler');
const Course = require('../models/Course.js');
const Branch = require('../models/Branch.js');
const Enrollment = require('../models/Enrollment.js');
const fs = require('fs');
const path = require('path');

// @desc    Get all courses, optionally filtered by branch
// @route   GET /api/courses
// @access  Public
const getAllCourses = asyncHandler(async (req, res) => {
    const { branchId } = req.query;
    let query = {};
    if (branchId) {
        query.branch = branchId;
    }
    const courses = await Course.find(query).populate('branch', 'name').sort({ title: 1 });
    res.status(200).json({ success: true, count: courses.length, data: courses });
});

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('branch', 'name');
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    res.status(200).json({ success: true, data: course });
});

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, branchId, instructor } = req.body;
    if (!title || !description || !branchId) {
        res.status(400);
        throw new Error('Title, description, and branch ID are required');
    }
    const branch = await Branch.findById(branchId);
    if (!branch) {
        res.status(400);
        throw new Error('Invalid Branch ID provided');
    }
    const course = await Course.create({
        title,
        description,
        branch: branchId,
        instructor,
    });
    const populatedCourse = await Course.findById(course._id).populate('branch', 'name');
    res.status(201).json({ success: true, data: populatedCourse });
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
    const { title, description, branchId, instructor } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    if (branchId) {
        const branch = await Branch.findById(branchId);
        if (!branch) {
            res.status(400);
            throw new Error('Invalid Branch ID provided for update');
        }
        course.branch = branchId;
    }
    course.title = title || course.title;
    course.description = description || course.description;
    course.instructor = instructor !== undefined ? instructor : course.instructor;
    const updatedCourse = await course.save();
    const populatedCourse = await Course.findById(updatedCourse._id).populate('branch', 'name');
    res.status(200).json({ success: true, data: populatedCourse });
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    await Enrollment.deleteMany({ course: req.params.id });
    await course.deleteOne();
    res.status(200).json({ success: true, message: 'Course and associated enrollments deleted successfully' });
});

// --- Content Functions ---
const addVideoToCourse = asyncHandler(async (req, res) => {
    const { title, videoId } = req.body;
    if (!title || !videoId) {
        res.status(400);
        throw new Error('Video title and YouTube Video ID are required.');
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found.');
    }
    course.youtubeVideos.push({ title, videoId });
    await course.save();
    res.status(201).json({ success: true, data: course });
});

const addNoteToCourse = asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Note title is required.');
    }
    if (!req.file) {
        res.status(400);
        throw new Error('Note file is required.');
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found.');
    }
    const noteUrl = `/${req.file.path.replace(/\\/g, "/")}`;
    course.notes.push({ title, url: noteUrl });
    await course.save();
    res.status(201).json({ success: true, data: course });
});

// @desc    Delete a video from a course
const deleteVideoFromCourse = asyncHandler(async (req, res) => {
    const { courseId, videoId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    course.youtubeVideos = course.youtubeVideos.filter(video => video._id.toString() !== videoId);
    await course.save();
    res.status(200).json({ success: true, data: course });
});

// @desc    Delete a note from a course
const deleteNoteFromCourse = asyncHandler(async (req, res) => {
    const { courseId, noteId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    const noteToDelete = course.notes.find(note => note._id.toString() === noteId);
    if (noteToDelete && noteToDelete.url) {
        const filePath = path.join(__dirname, '..', noteToDelete.url);
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete note file: ${filePath}`, err);
        });
    }
    course.notes = course.notes.filter(note => note._id.toString() !== noteId);
    await course.save();
    res.status(200).json({ success: true, data: course });
});

// @desc    Get all courses a specific student is enrolled in
const getEnrolledCourses = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const enrollments = await Enrollment.find({ user: studentId });
    if (!enrollments || enrollments.length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }
    const courseIds = enrollments.map(enrollment => enrollment.course);
    const courses = await Course.find({ '_id': { $in: courseIds } })
        .populate('branch', 'name')
        .sort({ title: 1 });
    res.status(200).json({ success: true, data: courses });
});

// Export all functions
module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideoToCourse,
    addNoteToCourse,
    deleteVideoFromCourse,
    deleteNoteFromCourse,
    getEnrolledCourses
};