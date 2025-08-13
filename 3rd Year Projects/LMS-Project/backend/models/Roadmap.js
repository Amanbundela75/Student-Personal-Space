// backend/models/Roadmap.js

const mongoose = require('mongoose');

const timelineStepSchema = new mongoose.Schema({
    year: {
        type: String,
        required: [true, 'Please provide the year or stage (e.g., First Year)'],
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for this timeline step'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for this step'],
    },
    skills: {
        type: [String],
        default: [],
    },
});

const roadmapSchema = new mongoose.Schema({
    seniorName: {
        type: String,
        required: [true, 'Please provide the senior\'s name'],
        trim: true,
    },
    seniorRole: {
        type: String,
        required: [true, 'Please provide the senior\'s role and company'],
        trim: true,
    },
    profileImage: {
        type: String,
        required: [true, 'Please provide a path to the profile image'],
    },
    introduction: {
        type: String,
        required: [true, 'Please provide a brief introduction'],
    },
    timeline: [timelineStepSchema],
    keyAdvice: {
        type: String,
    },
    // Yeh slug URL mein use hoga, jaise /seniors/priya-sharma
    slug: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Roadmap', roadmapSchema);