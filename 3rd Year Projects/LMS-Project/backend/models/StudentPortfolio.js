const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, default: 'Participant' }, // e.g., Participant, Organizer, Volunteer
    date: { type: Date },
});

const ConferenceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    date: { type: Date },
});

const CodingProfileSchema = new mongoose.Schema({
    platform: { type: String, required: true, enum: ['LeetCode', 'HackerRank', 'Codeforces', 'CodeChef', 'Other'] },
    profileUrl: { type: String, required: true },
});

const StudentPortfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Har student ka ek hi portfolio hoga
    },
    skills: [{
        type: String,
        trim: true,
    }],
    events: [EventSchema],
    conferences: [ConferenceSchema],
    codingProfiles: [CodingProfileSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('StudentPortfolio', StudentPortfolioSchema);