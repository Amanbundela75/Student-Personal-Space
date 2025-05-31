const Branch = require('../models/Branch.js');
const Course = require('../models/Course.js'); // To handle courses when deleting a branch

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
exports.getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, count: branches.length, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single branch by ID
// @route   GET /api/branches/:id
// @access  Public
exports.getBranchById = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, data: branch });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Branch not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private/Admin
exports.createBranch = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Branch name is required' });
    }
    try {
        const existingBranch = await Branch.findOne({ name });
        if (existingBranch) {
            return res.status(400).json({ success: false, message: 'Branch with this name already exists' });
        }
        const branch = await Branch.create({ name, description });
        res.status(201).json({ success: true, data: branch });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
exports.updateBranch = async (req, res) => {
    const { name, description } = req.body;
    try {
        let branch = await Branch.findById(req.params.id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        // Check if new name conflicts with another existing branch
        if (name && name !== branch.name) {
            const existingBranch = await Branch.findOne({ name });
            if (existingBranch) {
                return res.status(400).json({ success: false, message: 'Another branch with this name already exists' });
            }
        }

        branch.name = name || branch.name;
        branch.description = description !== undefined ? description : branch.description;

        const updatedBranch = await branch.save();
        res.status(200).json({ success: true, data: updatedBranch });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Branch not found (invalid ID format)' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
exports.deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        // Optional: Decide how to handle courses associated with this branch
        // Option 1: Prevent deletion if courses exist
        const coursesInBranch = await Course.countDocuments({ branch: req.params.id });
        if (coursesInBranch > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete branch. ${coursesInBranch} courses are associated with it. Please reassign or delete them first.`,
            });
        }
        // Option 2: Set courses' branch to null (requires Course model change) or delete them (cascade delete)

        await branch.deleteOne(); // Use deleteOne() or findByIdAndDelete(req.params.id)
        res.status(200).json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Branch not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};