const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Aapke User model ka reference
        required: true
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test', // Aapke Test model ka reference
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    // --- START: NAYA FIELD ADD KIYA GAYA ---
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        selectedOption: {
            type: Number,
            default: null, // Agar student ne question skip kiya ho
        }
    }],
    // --- END: NAYA FIELD ADD KIYA GAYA ---
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;