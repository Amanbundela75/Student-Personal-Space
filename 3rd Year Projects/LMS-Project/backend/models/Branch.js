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

module.exports = mongoose.model('Branch', BranchSchema);