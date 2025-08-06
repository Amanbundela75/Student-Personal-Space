const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Schema for Academics ---
const academicsSchema = new mongoose.Schema({
    currentSemester: { type: Number, default: 1 },
    cgpa: { type: Number, default: 0.0 },
    sgpa: { type: Number, default: 0.0 }
}, { _id: false });

// --- Schema for Projects ---
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['In Progress', 'Completed', 'On Hold'],
        default: 'In Progress'
    },
    githubLink: { type: String, trim: true }
});

// --- NEW: Schema for Certifications ---
const certificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true }, // e.g., "Coursera", "Udemy"
    fileUrl: { type: String, required: true } // Path to the uploaded PDF/image file
});


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],

    // --- Dashboard fields ---
    academics: {
        type: academicsSchema,
        default: () => ({})
    },
    projects: [projectSchema],

    // --- NEW: Add certifications array to the user schema ---
    certifications: [certificationSchema],

    profilePicture: {
        type: String,
        default: ''
    },
    // -----------------------------------------------------------

    idCardImageUrl: { type: String },
    faceDescriptor: { type: [Number] },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    lastLoginTimestamp: { type: Date },
    idCardVerificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password matching
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);