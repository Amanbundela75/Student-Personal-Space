const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testAttemptSchema = new Schema({
    test: {
        type: Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // === COURSE REFERENCE ADD KIYA GAYA HAI ===
    // Isse results ko course se filter karna aasan ho jayega
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // ==========================================
    answers: [{
        type: Number,
        default: null
    }],
    score: {
        type: Number,
        default: 0
    },
    proctoringLogs: [{
        type: String
    }],
    submitted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = TestAttempt;