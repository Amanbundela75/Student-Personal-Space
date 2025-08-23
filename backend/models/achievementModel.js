const mongoose = require('mongoose');

// --- Achievement Schema Definition ---
// Yeh schema batata hai ki har ek achievement post mein kya-kya save hoga.
const achievementSchema = new mongoose.Schema(
    {
        // Har achievement ek user se judi hogi.
        // 'ref: 'User'' batata hai ki yeh User model se link hai.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        // Achievement ka text description.
        description: {
            type: String,
            required: [true, 'Please add a description for your achievement.'],
            trim: true,
        },
        // Upload ki gayi file (image ya video) ka URL.
        mediaUrl: {
            type: String,
            required: [true, 'A media file (image or video) is required.'],
        },
        // Yeh batane ke liye ki file image hai ya video.
        // Isse frontend ko media display karne mein aasani hogi.
        mediaType: {
            type: String,
            required: true,
            enum: ['image', 'video'], // Sirf ye do values ho sakti hain.
        },
        // Achievement ki taarikh, default aaj ki taarikh hogi.
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        // Yeh automatically 'createdAt' aur 'updatedAt' fields jod dega.
        timestamps: true,
    }
);

// Schema se 'Achievement' naam ka model banayein.
const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;