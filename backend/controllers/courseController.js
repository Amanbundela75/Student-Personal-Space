const Course = require('../models/Course.js');
const Branch = require('../models/Branch.js');
const Enrollment = require('../models/Enrollment.js');

// ... (saara purana code waisa hi rahega, main sirf naye function ko aakhir mein badal raha hoon) ...
// ... (getAllCourses, getCourseById, createCourse, etc. sab same hain) ...

// @desc    Get all courses, optionally filtered by branch
// @route   GET /api/courses
// @route   GET /api/courses?branchId=<branchId>
// @access  Public
exports.getAllCourses = async (req, res) => {
    const { branchId } = req.query;
    let query = {};

    if (branchId) {
        const branchExists = await Branch.findById(branchId);
        if (!branchExists) {
            return res.status(404).json({ success: false, message: 'Branch not found for filtering courses' });
        }
        query.branch = branchId;
    }

    try {
        const courses = await Course.find(query).populate('branch', 'name').sort({ title: 1 });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('branch', 'name description');
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Course not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    const { title, description, branchId, instructor, youtubeVideos, notes } = req.body;

    if (!title || !description || !branchId) {
        return res.status(400).json({ success: false, message: 'Title, description, and branch ID are required' });
    }

    try {
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(400).json({ success: false, message: 'Invalid Branch ID provided' });
        }

        const course = await Course.create({
            title,
            description,
            branch: branchId,
            instructor,
            youtubeVideos: youtubeVideos || [],
            notes: notes || [],
        });
        const populatedCourse = await Course.findById(course._id).populate('branch', 'name');
        res.status(201).json({ success: true, data: populatedCourse });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    const { title, description, branchId, instructor, youtubeVideos, notes } = req.body;
    try {
        let course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (branchId) {
            const branch = await Branch.findById(branchId);
            if (!branch) {
                return res.status(400).json({ success: false, message: 'Invalid Branch ID provided for update' });
            }
            course.branch = branchId;
        }

        course.title = title || course.title;
        course.description = description || course.description;
        course.instructor = instructor !== undefined ? instructor : course.instructor;
        course.youtubeVideos = youtubeVideos || course.youtubeVideos;
        course.notes = notes || course.notes;

        const updatedCourse = await course.save();
        const populatedCourse = await Course.findById(updatedCourse._id).populate('branch', 'name');
        res.status(200).json({ success: true, data: populatedCourse });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Course not found (invalid ID format)' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        await Enrollment.deleteMany({ course: req.params.id });

        await course.deleteOne();
        res.status(200).json({ success: true, message: 'Course and associated enrollments deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Course not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Content Functions ---
exports.addVideoToCourse = async (req, res) => {
    const { title, videoId } = req.body;
    if (!title || !videoId) {
        return res.status(400).json({ success: false, message: 'Video title and YouTube Video ID are required.' });
    }
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        course.youtubeVideos.push({ title, videoId });
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while adding video.' });
    }
};

exports.addNoteToCourse = async (req, res) => {
    const { title, content, url } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, message: 'Note title is required.' });
    }
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        course.notes.push({ title, content, url });
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while adding note.' });
    }
};


// =================================================================
// === START: CORRECTED FUNCTION FOR ENROLLED COURSES            ===
// =================================================================
// @desc    Get all courses a specific student is enrolled in
// @route   GET /api/courses/my-courses
// @access  Private (Student)
exports.getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Step 1: Find all enrollments for the logged-in student using the correct field name 'user'
        const enrollments = await Enrollment.find({ user: studentId });

        if (!enrollments || enrollments.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const courseIds = enrollments.map(enrollment => enrollment.course);

        const courses = await Course.find({ '_id': { $in: courseIds } })
            .populate('branch', 'name')
            .sort({ title: 1 });

        res.status(200).json({ success: true, count: courses.length, data: courses });

    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ success: false, message: 'Server Error while fetching enrolled courses.' });
    }
};
// =================================================================
// === END: CORRECTED FUNCTION                                   ===
// =================================================================