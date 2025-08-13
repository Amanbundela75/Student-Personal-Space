// backend/controllers/roadmapController.js

const Roadmap = require('../models/Roadmap.js');
const asyncHandler = require('express-async-handler');

// @desc    Create a new roadmap
// @route   POST /api/roadmaps
// @access  Private/Admin
exports.createRoadmap = asyncHandler(async (req, res) => {
    const { seniorName, seniorRole, profileImage, introduction, timeline, keyAdvice, slug } = req.body;

    const roadmapExists = await Roadmap.findOne({ slug });
    if (roadmapExists) {
        res.status(400);
        throw new Error('Roadmap with this slug already exists');
    }

    const roadmap = await Roadmap.create({
        seniorName,
        seniorRole,
        profileImage,
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
        roadmap.profileImage = req.body.profileImage || roadmap.profileImage;
        roadmap.introduction = req.body.introduction || roadmap.introduction;
        roadmap.timeline = req.body.timeline || roadmap.timeline;
        roadmap.keyAdvice = req.body.keyAdvice || roadmap.keyAdvice;
        roadmap.slug = req.body.slug || roadmap.slug;

        const updatedRoadmap = await roadmap.save();
        res.status(200).json(updatedRoadmap);
    } else {
        res.status(404);
        throw new Error('Roadmap not found');
    }
});


// === DELETE ROADMAP FUNCTION UPDATE START ===
// @desc    Delete a roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private/Admin
exports.deleteRoadmap = asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findById(req.params.id);

    if (roadmap) {
        // Purane .remove() ki jagah ab hum .deleteOne() ka istemal karenge
        await roadmap.deleteOne();
        res.status(200).json({ message: 'Roadmap removed successfully' });
    } else {
        res.status(404);
        throw new Error('Roadmap not found');
    }
});
// === DELETE ROADMAP FUNCTION UPDATE END ===