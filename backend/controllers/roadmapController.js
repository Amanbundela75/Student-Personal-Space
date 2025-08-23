const Roadmap = require('../models/Roadmap.js');
const asyncHandler = require('express-async-handler');

// Helper function to create a URL-friendly slug
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};


// @desc    Create a new roadmap
// @route   POST /api/roadmaps
// @access  Private/Admin
exports.createRoadmap = asyncHandler(async (req, res) => {
    // Text fields req.body se aayenge
    const { seniorName, seniorRole, introduction, keyAdvice } = req.body;
    // Timeline JSON string mein aayega, use parse karna hoga
    const timeline = JSON.parse(req.body.timeline);

    if (!req.file) {
        res.status(400);
        throw new Error('Profile image is required.');
    }

    // Slug ko senior ke naam se automatically generate karein
    const slug = slugify(seniorName);
    const roadmapExists = await Roadmap.findOne({ slug });
    if (roadmapExists) {
        res.status(400);
        throw new Error('A roadmap for this senior already exists.');
    }

    const roadmap = await Roadmap.create({
        seniorName,
        seniorRole,
        profileImage: `/${req.file.path.replace(/\\/g, "/")}`, // File ka path save karein
        introduction,
        timeline,
        keyAdvice,
        slug,
    });

    res.status(201).json(roadmap);
});

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
// @access  Public
exports.getAllRoadmaps = asyncHandler(async (req, res) => {
    const roadmaps = await Roadmap.find({});
    res.status(200).json(roadmaps);
});

// @desc    Get a single roadmap by its slug
// @route   GET /api/roadmaps/:slug
// @access  Public
exports.getRoadmapBySlug = asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findOne({ slug: req.params.slug });

    if (roadmap) {
        res.status(200).json(roadmap);
    } else {
        res.status(404);
        throw new Error('Roadmap not found');
    }
});

// @desc    Update a roadmap
// @route   PUT /api/roadmaps/:id
// @access  Private/Admin
exports.updateRoadmap = asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findById(req.params.id);

    if (roadmap) {
        roadmap.seniorName = req.body.seniorName || roadmap.seniorName;
        roadmap.seniorRole = req.body.seniorRole || roadmap.seniorRole;
        roadmap.introduction = req.body.introduction || roadmap.introduction;
        roadmap.keyAdvice = req.body.keyAdvice || roadmap.keyAdvice;

        // Agar naya naam diya gaya hai, toh slug ko bhi update karein
        if (req.body.seniorName) {
            roadmap.slug = slugify(req.body.seniorName);
        }

        // Agar nayi image upload hui hai, toh path update karein
        if (req.file) {
            roadmap.profileImage = `/${req.file.path.replace(/\\/g, "/")}`;
        }

        // Timeline ko parse karke update karein
        if (req.body.timeline) {
            roadmap.timeline = JSON.parse(req.body.timeline);
        }

        const updatedRoadmap = await roadmap.save();
        res.status(200).json(updatedRoadmap);
    } else {
        res.status(404);
        throw new Error('Roadmap not found');
    }
});


// @desc    Delete a roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private/Admin
exports.deleteRoadmap = asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findById(req.params.id);

    if (roadmap) {
        await roadmap.deleteOne();
        res.status(200).json({ message: 'Roadmap removed successfully' });
    } else {
        res.status(404);
        throw new Error('Roadmap not found');
    }
});