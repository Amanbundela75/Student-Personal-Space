const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Naya Schema: Academics ke liye ---
const academicsSchema = new mongoose.Schema({
    currentSemester: { type: Number, default: 1 },
    cgpa: { type: Number, default: 0.0 },
    sgpa: { type: Number, default: 0.0 }
}, { _id: false }); // _id: false, kyonki yah ek sub-document hai

// --- Naya Schema: Projects ke liye ---
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['In Progress', 'Completed', 'On Hold'],
        default: 'In Progress'
    },
    githubLink: { type: String, trim: true }
}); // Yahan default _id banega jo har project ke liye unique hoga

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

    // --- DASHBOARD KE LIYE NAYE FIELDS YAHAN ADD KIYE GAYE HAIN ---
    academics: {
        type: academicsSchema,
        default: () => ({}) // Default values ke saath ek naya object banata hai
    },
    projects: [projectSchema], // Projects ka ek array

    // --- UPDATE: Background image ko Profile Picture se badal diya gaya hai ---
    profilePicture: {
        type: String,
        default: '' // Default mein koi image nahi hogi
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

// --- UPDATE: Is line ko badal diya gaya hai taaki error na aaye ---
module.exports = mongoose.models.User || mongoose.model('User', userSchema);