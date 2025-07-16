const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
    },
    /**
     * Replaced the old 'progress' and 'completedAt' fields.
     * This array will store the _id of each completed video or note.
     * This is a much more robust way to track progress.
     */
    completedContent: [{
        type: mongoose.Schema.Types.ObjectId,
        // We don't need a 'ref' here because these IDs belong to sub-documents
        // inside the Course model, not a separate collection.
    }],
});

// Ensure a user can enroll in a specific course only once
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);