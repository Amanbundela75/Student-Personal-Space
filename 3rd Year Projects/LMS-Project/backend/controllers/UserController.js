const User = require('../models/User.js');
const asyncHandler = require('../middleware/asyncHandler.js');
// Ye models 'populate' ke liye zaroori hain
const Course = require('../models/Course.js');
const Branch = require('../models/Branch.js');


// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // 'protect' middleware se humein req.user mil jaata hai
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('branch', 'name')
        .populate('enrolledCourses', 'title imageUrl');

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            branch: user.branch,
            enrolledCourses: user.enrolledCourses,
            createdAt: user.createdAt,
            // --- NAYA DATA BHEJA JA RAHA HAI ---
            academics: user.academics,
            projects: user.projects,
            // ------------------------------------
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Update user academics
// @route   PUT /api/users/profile/academics
// @access  Private
const updateUserAcademics = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { currentSemester, cgpa, sgpa } = req.body;
        user.academics.currentSemester = currentSemester ?? user.academics.currentSemester;
        user.academics.cgpa = cgpa ?? user.academics.cgpa;
        user.academics.sgpa = sgpa ?? user.academics.sgpa;

        const updatedUser = await user.save();
        res.status(200).json(updatedUser.academics);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add a new project for a user
// @route   POST /api/users/profile/projects
// @access  Private
const addUserProject = asyncHandler(async (req, res) => {
    const { title, description, status, githubLink } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        const newProject = {
            title,
            description,
            status,
            githubLink
        };
        user.projects.push(newProject);

        await user.save();
        // Naye project ko response mein bhejein (jo array mein aakhiri hoga)
        res.status(201).json(user.projects[user.projects.length - 1]);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update a user's project
// @route   PUT /api/users/profile/projects/:projectId
// @access  Private
const updateUserProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, status, githubLink } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        const project = user.projects.id(projectId);
        if (project) {
            project.title = title || project.title;
            project.description = description || project.description;
            project.status = status || project.status;
            project.githubLink = githubLink || project.githubLink;

            await user.save();
            res.status(200).json(project);
        } else {
            res.status(404);
            throw new Error('Project not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete a user's project
// @route   DELETE /api/users/profile/projects/:projectId
// @access  Private
const deleteUserProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user = await User.findById(req.user._id);

    if (user) {
        const project = user.projects.id(projectId);
        if (project) {
            project.deleteOne(); // Mongoose 8+ style
            await user.save();
            res.status(200).json({ message: 'Project removed successfully' });
        } else {
            res.status(404);
            throw new Error('Project not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// --- ADMIN ROUTES (No changes below) ---

// @desc    Get all users by Admin
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
});

// @desc    Get user by ID by Admin
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user by Admin
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user by Admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.isEmailVerified = req.body.isEmailVerified;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            isEmailVerified: updatedUser.isEmailVerified,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUserProfile,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,

    // --- NAYE FUNCTIONS EXPORT KIYE GAYE HAIN ---
    updateUserAcademics,
    addUserProject,
    updateUserProject,
    deleteUserProject,
};