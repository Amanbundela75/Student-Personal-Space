const StudentPortfolio = require('../models/StudentPortfolio.js');

// @desc    Get or create user's portfolio
// @route   GET /api/portfolio
// @access  Private (Student)
exports.getPortfolio = async (req, res) => {
    try {
        // Find portfolio for the logged-in user
        let portfolio = await StudentPortfolio.findOne({ user: req.user.id });

        // If no portfolio exists, create a blank one
        if (!portfolio) {
            portfolio = new StudentPortfolio({ user: req.user.id });
            await portfolio.save();
        }

        res.status(200).json({ success: true, data: portfolio });
    } catch (error) {
        console.error('Get Portfolio Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user's portfolio
// @route   PUT /api/portfolio
// @access  Private (Student)
exports.updatePortfolio = async (req, res) => {
    try {
        const { skills, events, conferences, codingProfiles } = req.body;

        let portfolio = await StudentPortfolio.findOne({ user: req.user.id });

        if (!portfolio) {
            return res.status(404).json({ success: false, message: 'Portfolio not found.' });
        }

        // Update fields if they are provided in the request
        if (skills) portfolio.skills = skills;
        if (events) portfolio.events = events;
        if (conferences) portfolio.conferences = conferences;
        if (codingProfiles) portfolio.codingProfiles = codingProfiles;

        const updatedPortfolio = await portfolio.save();

        res.status(200).json({ success: true, data: updatedPortfolio });
    } catch (error) {
        console.error('Update Portfolio Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};