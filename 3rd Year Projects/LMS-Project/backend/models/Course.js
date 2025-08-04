const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String }, // Can be markdown text, or simple text
    url: { type: String, trim: true }, // Optional: if notes are external links
    // Add other fields like type: 'text' | 'pdf' | 'link' if you want more structure
});

const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    videoId: { type: String, required: true, trim: true }, // YouTube video ID (e.g., dQw4w9WgXcQ)
    description: { type: String, trim: true }, // Optional short description
});

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch is required for a course'],
    },
    instructor: {
        type: String,
        default: 'Platform Admin'
    },
    // New fields for content:
    youtubeVideos: [VideoSchema], // Array of video objects
    notes: [NoteSchema],         // Array of note objects
    createdAt: { type: Date, default: Date.now },
});

// --- UPDATE: Is line ko badal diya gaya hai taaki error na aaye ---
module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);