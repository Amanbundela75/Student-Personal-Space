// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    branch: { // Store ObjectId of the selected branch
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null,
    },
    idCardImageUrl: { type: String },
    idCardVerificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
        default: 'not_uploaded'
    },
    lastLoginTimestamp: { type: Date },
    // isActiveNow: { type: Boolean, default: false }, // More complex to manage directly here
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);