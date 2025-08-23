const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware'); // Protect routes
const Portfolio = require('../../models/StudentPortfolio');
const { syncPortfolioData } = require('../services/PlatformFetchers');

// @route   GET /api/v1/portfolio
// @desc    Get the current user's portfolio
router.get('/', authMiddleware, async (req, res) => {
    try {
        let portfolio = await Portfolio.findOne({ user: req.user.id });
        if (!portfolio) {
            // If no portfolio, create a default one
            portfolio = new Portfolio({ user: req.user.id, codingProfiles: {}, stats: {} });
            await portfolio.save();
        }
        res.json(portfolio);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/v1/portfolio
// @desc    Update user portfolio (and trigger sync)
router.put('/', authMiddleware, async (req, res) => {
    // Destructure only the fields a user is allowed to edit
    const { bio, socialLinks, codingProfiles } = req.body;

    try {
        let portfolio = await Portfolio.findOne({ user: req.user.id });
        if (!portfolio) return res.status(404).json({ msg: 'Portfolio not found' });

        // Update the fields
        if (bio) portfolio.bio = bio;
        if (socialLinks) portfolio.socialLinks = socialLinks;
        if (codingProfiles) portfolio.codingProfiles = codingProfiles;

        await portfolio.save(); // Save the usernames first

        // --- THE CRITICAL PART ---
        // Now, trigger the sync in the background. We don't wait for it.
        // The user gets an immediate response that their profile is saved.
        syncPortfolioData(portfolio);

        // Send back the portfolio as it is now. The stats will update later.
        res.json(portfolio);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @routePOST /api/v1/portfolio/sync
// @descManually trigger a data sync
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        let portfolio = await Portfolio.findOne({ user: req.user.id });
        if (!portfolio) return res.status(404).json({ msg: 'Portfolio not found' });

        // Here, we await the result because the user explicitly clicked "Sync"
        const updatedPortfolio = await syncPortfolioData(portfolio);

        res.json(updatedPortfolio);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;