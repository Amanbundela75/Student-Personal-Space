const Enrollment = require('../models/Enrollment.js');
const Course = require('../models/Course.js');
require('../models/User.js');

// @desc    Enroll a student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
exports.enrollInCourse = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!courseId) {
        return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Privacy: Students can only enroll themselves.
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
        if (error.code === 11000) { // Duplicate key error (for unique index on user+course)
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
        // Privacy: Fetch only enrollments for the currently logged-in user
        const enrollments = await Enrollment.find({ user: req.user.id })
            .populate('course', 'title description branch instructor') // Populate course details
            .populate({
                path: 'course',
                populate: {
                    path: 'branch',
                    select: 'name' // Further populate branch name within course
                }
            })
            .sort({ enrolledAt: -1 });

        res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Update enrollment progress (by student for their own enrollment)
// @route   PUT /api/enrollments/:id/progress
// @access  Private (Student)
exports.updateEnrollmentProgress = async (req, res) => {
    const { progress } = req.body;
    const enrollmentId = req.params.id;
    const userId = req.user.id;

    if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({ success: false, message: 'Progress must be a number between 0 and 100.' });
    }

    try {
        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        // Privacy: Ensure the student is updating their own enrollment
        if (enrollment.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this enrollment.' });
        }

        enrollment.progress = progress;
        if (progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = Date.now();
        } else if (progress < 100) {
            enrollment.completedAt = null; // Reset completion if progress drops below 100
        }


        await enrollment.save();
        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate('course', 'title'); // Populate as needed

        res.status(200).json({ success: true, data: populatedEnrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error updating progress.' });
    }
};


// @desc    Get all enrollments (Admin only)
// @route   GET /api/enrollments/all
// @access  Private (Admin)
exports.getAllEnrollmentsAdmin = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .populate('user', 'firstName lastName email') // Populate user details
            .populate('course', 'title') // Populate course details
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
    const currentUser = req.user; // From auth middleware

    try {
        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        // Privacy Check: Student can only delete their own enrollment. Admin can delete any.
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