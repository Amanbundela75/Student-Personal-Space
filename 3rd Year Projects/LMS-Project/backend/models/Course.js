const mongoose = require('mongoose');

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
    instructor: { // Optional: could be a string or ref to User model (admin/teacher role)
        type: String,
        default: 'Platform Admin'
    },
    // Future enhancements:
    // modules: [{ title: String, lessons: [{ title: String, contentType: String, contentUrl: String }] }]
    // price: { type: Number, default: 0 }
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', CourseSchema);