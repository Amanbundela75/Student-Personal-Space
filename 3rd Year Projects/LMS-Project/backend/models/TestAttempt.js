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
        ref: 'User', // Assuming you have a 'User' model
        required: true
    },
    answers: {
        type: Map,
        of: String // Storing question ObjectID and the selected option
    },
    score: {
        type: Number,
        default: 0
    },
    proctoringLogs: [{
        type: String // e.g., "Left fullscreen", "Switched tab"
    }],
    submitted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = TestAttempt;