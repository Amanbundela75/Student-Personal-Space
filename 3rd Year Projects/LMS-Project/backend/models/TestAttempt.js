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
    answers: [{ // <-- ISE UPDATE KIYA GAYA HAI
        // Yeh har question ke liye student ka jawab store karega.
        // Array ka index question ke index se match karega.
        // Value chune gaye option ka index hoga.
        // Agar student ne jawab nahi diya to null hoga.
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