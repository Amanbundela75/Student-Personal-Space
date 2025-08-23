const Feedback = require('../models/Feedback');

// Submit feedback (student)
exports.submitFeedback = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const feedback = new Feedback({ name, email, message });
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit feedback.', error: err.message });
    }
};

// Get all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
    try {
        // You may want to add extra admin authentication here!
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch feedback.', error: err.message });
    }
};