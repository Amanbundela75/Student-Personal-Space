const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Branch name is required'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    createdAt: { type: Date, default: Date.now },
});

// --- UPDATE: Is line ko badal diya gaya hai taaki error na aaye ---
module.exports = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);