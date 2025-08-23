const mongoose = require('mongoose');

// Schema for individual platform stats
const PlatformStatSchema = new mongoose.Schema({
    total: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    badges: [String],
    meta: {
        fetchedAt: Date,
        error: String,
        detail: String
    }
});

const PortfolioSchema = new mongoose.Schema({
    user: { // Field ka naam 'user' hona chahiye
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // 'unique' ka niyam 'user' field par hona chahiye
    },
    bio: { type: String, maxLength: 250 },
    socialLinks: {
        linkedin: String,
        github: String
    },
    codingProfiles: {
        leetcode: String,
        gfg: String,
        codeforces: String,
        hackerrank: String
    },
    // This is where fetched stats are stored
    stats: {
        leetcode: PlatformStatSchema,
        gfg: PlatformStatSchema,
        codeforces: PlatformStatSchema,
        hackerrank: PlatformStatSchema
    },
    // You can add streakValues, activityLog etc. here too
    streakValues: [{ date: String, count: Number }],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);