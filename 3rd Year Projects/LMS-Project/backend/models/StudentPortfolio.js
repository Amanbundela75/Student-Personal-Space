const mongoose = require('mongoose');

// --- Sub-Schemas for better organization ---
const SocialLinksSchema = new mongoose.Schema({
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true },
    website: { type: String, trim: true },
}, { _id: false });

const AwardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuer: { type: String }, // e.g., "LeetCode"
    date: { type: Date },
    icon: { type: String } // We can store an icon name (e.g., 'python')
});

const ProblemStatsSchema = new mongoose.Schema({
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
}, { _id: false });

// --- Main Portfolio Schema ---
const StudentPortfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // Section 1: Personal Info
    bio: {
        type: String,
        maxlength: 250,
        default: 'A passionate learner and developer.'
    },
    socialLinks: SocialLinksSchema,

    // Section 2: Skills & Awards
    skills: [{
        type: String,
        trim: true,
    }],
    awards: [AwardSchema],

    // Section 3: Coding Profiles & Stats (Manually Entered for now)
    codingProfiles: [{
        platform: { type: String, required: true, enum: ['LeetCode', 'HackerRank', 'Codeforces', 'CodeChef', 'Other'] },
        profileUrl: { type: String, required: true },
    }],
    problemStats: ProblemStatsSchema,

    // Section 4: Events & Conferences
    events: [{
        name: { type: String, required: true },
        role: { type: String, default: 'Participant' },
        date: { type: Date },
    }],
    conferences: [{
        name: { type: String, required: true },
        location: { type: String },
        date: { type: Date },
    }],

}, {
    timestamps: true,
});

module.exports = mongoose.model('StudentPortfolio', StudentPortfolioSchema);