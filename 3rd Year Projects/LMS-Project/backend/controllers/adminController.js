const User = require('../models/User.js');
const Branch = require('../models/Branch.js');
const Enrollment = require('../models/Enrollment.js');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .populate('branch', 'name') // Populate branch name
            .select('-password') // Exclude password
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single user by ID (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('branch', 'name description')
            .select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Optionally, fetch user's enrollments
        const enrollments = await Enrollment.find({ user: user._id })
            .populate('course', 'title');

        res.status(200).json({ success: true, data: { user, enrollments } });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'User not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a user's details (Admin - e.g., role, branch)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserByAdmin = async (req, res) => {
    const { firstName, lastName, email, role, branchId, isActiveNow } = req.body; // Add other fields as needed
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from changing their own role to student accidentally or updating superadmin password
        if (user.email === 'admin@example.com' && role && role !== 'admin') { // Assuming a super admin email
            return res.status(400).json({ success: false, message: 'Cannot change the role of the primary admin account.' });
        }
        if (req.user.id === req.params.id && role && role !== req.user.role) {
            return res.status(400).json({ success: false, message: 'Admin cannot change their own role via this endpoint.' });
        }


        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;

        // Validate email if changed
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
            }
            user.email = email;
        }

        if (role && ['student', 'admin'].includes(role)) {
            user.role = role;
        } else if (role) {
            return res.status(400).json({ success: false, message: 'Invalid role specified.' });
        }

        if (branchId) {
            const branch = await Branch.findById(branchId);
            if (!branch) {
                return res.status(400).json({ success: false, message: 'Invalid Branch ID' });
            }
            user.branch = branchId;
        } else if (branchId === null || branchId === '') { // Allow unsetting branch
            user.branch = null;
        }


        if (typeof isActiveNow === 'boolean') {
            user.isActiveNow = isActiveNow; // Note: True real-time status is more complex
        }

        // Password change should be handled separately or with more care by admin
        // For example, an admin might reset a password, not directly set it.

        user.updatedAt = Date.now();
        const updatedUser = await user.save({ validateBeforeSave: true }); // Ensure model validations run
        const populatedUser = await User.findById(updatedUser._id).populate('branch', 'name').select('-password');


        res.status(200).json({ success: true, data: populatedUser });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'User not found (invalid ID format)' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves or a super admin
        if (user.email === 'admin@example.com') { // Assuming a primary admin email
            return res.status(400).json({ success: false, message: 'Cannot delete the primary admin account.' });
        }
        if (req.user.id === req.params.id) {
            return res.status(400).json({ success: false, message: 'Admin cannot delete their own account via this endpoint.' });
        }


        // Remove associated enrollments for the user
        await Enrollment.deleteMany({ user: req.params.id });

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User and their enrollments deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'User not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};