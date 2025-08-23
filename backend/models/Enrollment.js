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
    // The 'enrolledAt' field is no longer needed because timestamps will handle it.

    completedContent: [{
        type: mongoose.Schema.Types.ObjectId,
    }],
}, {
    // === TIMESTAMPS OPTION ADDED HERE ===
    // This automatically adds 'createdAt' and 'updatedAt' fields to your schema.
    timestamps: true
});

// Ensure a user can enroll in a specific course only once
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);