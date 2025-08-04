const asyncHandler = require('../middleware/asyncHandler.js');
const Achievement = require('../models/achievementModel.js');
const path = require('path');
const fs = require('fs');

// @desc    Get all achievements for the logged-in user
// @route   GET /api/achievements
// @access  Private
const getAchievements = asyncHandler(async (req, res) => {
    // Sirf logged-in user ke achievements find karein aur naye se purane sort karein.
    const achievements = await Achievement.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(achievements);
});

// @desc    Add a new achievement
// @route   POST /api/achievements
// @access  Private
const addAchievement = asyncHandler(async (req, res) => {
    const { description } = req.body;

    // Check karein ki description hai ya nahi.
    if (!description) {
        res.status(400);
        throw new Error('Description is required.');
    }

    // Check karein ki file upload hui hai ya nahi.
    if (!req.file) {
        res.status(400);
        throw new Error('Media file (image or video) is required.');
    }

    // Naya achievement object banayein.
    const newAchievement = new Achievement({
        user: req.user._id,
        description: description,
        mediaUrl: `/uploads/${req.file.filename}`, // File ka web-accessible path.
        // File ke mimetype se pata lagayein ki yeh image hai ya video.
        mediaType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
    });

    // Database mein save karein.
    const createdAchievement = await newAchievement.save();
    res.status(201).json(createdAchievement);
});

// @desc    Update an achievement
// @route   PUT /api/achievements/:id
// @access  Private
const updateAchievement = asyncHandler(async (req, res) => {
    const { description } = req.body;
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
        res.status(404);
        throw new Error('Achievement not found.');
    }

    // Security check: Sunishchit karein ki user apni hi achievement update kar raha hai.
    if (achievement.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to update this achievement.');
    }

    // Description ko update karein agar naya description diya gaya hai.
    if (description) {
        achievement.description = description;
    }

    // Agar nayi file upload hui hai to use update karein.
    if (req.file) {
        // Purani file ko server se delete karein.
        const oldMediaPath = path.join(__dirname, '..', achievement.mediaUrl);
        fs.unlink(oldMediaPath, (err) => {
            if (err) console.error(`Failed to delete old media: ${oldMediaPath}`, err);
        });

        // Nayi file ka path aur type set karein.
        achievement.mediaUrl = `/uploads/${req.file.filename}`;
        achievement.mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    }

    const updatedAchievement = await achievement.save();
    res.status(200).json(updatedAchievement);
});

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
// @access  Private
const deleteAchievement = asyncHandler(async (req, res) => {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
        res.status(404);
        throw new Error('Achievement not found.');
    }

    // Security check: User apni hi achievement delete kar sakta hai.
    if (achievement.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this achievement.');
    }

    // Associated media file ko server se delete karein.
    const mediaPath = path.join(__dirname, '..', achievement.mediaUrl);
    fs.unlink(mediaPath, (err) => {
        if (err) console.error(`Failed to delete media on cleanup: ${mediaPath}`, err);
    });

    // Database se achievement ko remove karein.
    await achievement.deleteOne();

    res.status(200).json({ message: 'Achievement removed successfully.', id: req.params.id });
});


module.exports = {
    getAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement,
};