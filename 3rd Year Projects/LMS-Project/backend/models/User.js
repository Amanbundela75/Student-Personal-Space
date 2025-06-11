// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // `select: false` to not return it by default
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null,
    },
    // --- Naye Fields ---
    faceDescriptor: {
        type: [Number], // Face-api.js se mile descriptor (array of numbers) ko store karega
        required: false, // Optional, taaki admin users bina iske bhi ban sakein
    },
    isEmailVerified: {
        type: Boolean,
        default: false, // Default mein email verified nahi hoga
    },
    emailVerificationToken: {
        type: String,
        select: false, // Isko bhi default query mein na bhejein
    },
    idCardImageUrl: { type: String }, // ID Card ka URL
    idCardVerificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
        default: 'not_uploaded'
    },
    lastLoginTimestamp: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

// Password hash karne ke liye pre-save hook
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password compare karne ke liye method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);