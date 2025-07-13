const Enrollment = require('../models/Enrollment.js');
const Course = require('../models/Course.js');
require('../models/User.js');

// @desc    Enroll a student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
exports.enrollInCourse = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id; // From auth.js middleware

    if (!courseId) {
        return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            user: userId,
            course: courseId,
        });

        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate('user', 'firstName lastName email')
            .populate('course', 'title description');

        res.status(201).json({ success: true, data: populatedEnrollment });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Enrollment failed, possibly already enrolled.' });
        }
        res.status(500).json({ success: false, message: 'Server Error during enrollment' });
    }
};

// @desc    Get enrollments for the logged-in student
// @route   GET /api/enrollments/my
// @access  Private (Student)
exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user.id })
            .populate({
                path: 'course',
                select: 'title description branch instructor youtubeVideos notes', // Added content fields
                populate: {
                    path: 'branch',
                    select: 'name'
                }
            })
            .sort({ enrolledAt: -1 });

        res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
    } catch (error) {
        console.error('Get My Enrollments Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// =================================================================
//      NEW FUNCTIONALITY: Mark Content as Complete/Incomplete
// =================================================================

// @desc    Mark a piece of course content (video/note) as complete
// @route   POST /api/enrollments/:enrollmentId/complete
// @access  Private (Student)
exports.markContentAsComplete = async (req, res) => {
    const { enrollmentId } = req.params;
    const { contentId } = req.body;
    const userId = req.user.id;

    if (!contentId) {
        return res.status(400).json({ success: false, message: 'Content ID is required.' });
    }

    try {
        const enrollment = await Enrollment.findById(enrollmentId).populate('course');

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        if (enrollment.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this enrollment.' });
        }

        const course = enrollment.course;
        const allContentIds = [...course.youtubeVideos.map(v => v._id.toString()), ...course.notes.map(n => n._id.toString())];

        if (!allContentIds.includes(contentId)) {
            return res.status(404).json({ success: false, message: 'This content does not exist in this course.' });
        }

        // Add to completedContent array if it's not already there
        if (!enrollment.completedContent.includes(contentId)) {
            enrollment.completedContent.push(contentId);
            await enrollment.save();
        }

        res.status(200).json({ success: true, data: enrollment });

    } catch (error) {
        console.error('Mark as Complete Error:', error);
        res.status(500).json({ success: false, message: 'Server Error updating progress.' });
    }
};

// @desc    Mark a piece of course content (video/note) as INCOMPLETE
// @route   POST /api/enrollments/:enrollmentId/incomplete
// @access  Private (Student)
exports.markContentAsIncomplete = async (req, res) => {
    const { enrollmentId } = req.params;
    const { contentId } = req.body;
    const userId = req.user.id;

    if (!contentId) {
        return res.status(400).json({ success: false, message: 'Content ID is required.' });
    }

    try {
        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        if (enrollment.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this enrollment.' });
        }

        // Remove from completedContent array
        enrollment.completedContent = enrollment.completedContent.filter(id => id.toString() !== contentId);
        await enrollment.save();

        res.status(200).json({ success: true, data: enrollment });

    } catch (error) {
        console.error('Mark as Incomplete Error:', error);
        res.status(500).json({ success: false, message: 'Server Error updating progress.' });
    }
};


// =================================================================
//      ADMIN and OTHER Functions (No Changes Below)
// =================================================================

// @desc    Get all enrollments (Admin only)
// @route   GET /api/enrollments/all
// @access  Private (Admin)
exports.getAllEnrollmentsAdmin = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .populate('user', 'firstName lastName email')
            .populate('course', 'title')
            .sort({ enrolledAt: -1 });

        res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single enrollment by ID (Admin only)
// @route   GET /api/enrollments/:id
// @access  Private (Admin)
exports.getEnrollmentByIdAdmin = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('user', 'firstName lastName email role branch')
            .populate({
                path: 'course',
                populate: { path: 'branch', select: 'name' }
            });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }
        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Enrollment not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Unenroll a student from a course (Student can unenroll themselves or Admin can unenroll anyone)
// @route   DELETE /api/enrollments/:id
// @access  Private (Student for own, Admin for any)
exports.unenrollFromCourse = async (req, res) => {
    const enrollmentId = req.params.id;
    const currentUser = req.user;

    try {
        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        if (currentUser.role !== 'admin' && enrollment.user.toString() !== currentUser.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to perform this action.' });
        }

        await enrollment.deleteOne();
        res.status(200).json({ success: true, message: 'Successfully unenrolled from the course.' });

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Enrollment not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error during unenrollment.' });
    }
};