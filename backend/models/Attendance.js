// backend/models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: { // User ID of the student
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loginTimestamp: {
        type: Date,
        default: Date.now
    },
    // आप चाहें तो logoutTimestamp भी जोड़ सकते हैं, लेकिन उसके लिए अलग लॉजिक लगेगा
});

module.exports = mongoose.model('Attendance', AttendanceSchema);