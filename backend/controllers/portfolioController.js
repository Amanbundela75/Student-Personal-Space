const Portfolio = require('../models/StudentPortfolio');
// --- FIX #1: Yahan sahi function ka naam import karein ---
const { syncPortfolioData } = require('../servers/services/platformFetchers');

// Helper function (yeh theek hai)
function getChangedPlatforms(prevProfiles = {}, nextProfiles = {}) {
    const keys = new Set([...Object.keys(prevProfiles), ...Object.keys(nextProfiles)]);
    const changed = [];
    for (const k of keys) {
        if ((prevProfiles[k] || '') !== (nextProfiles[k] || '')) changed.push(k);
    }
    return changed;
}

// GET Portfolio (Yeh pehle se theek hai)
exports.getPortfolio = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let doc = await Portfolio.findOne({ user: userId }).lean();

        if (!doc) {
            doc = await Portfolio.create({ user: userId, bio: '', socialLinks: {}, codingProfiles: {}, stats: {} });
        }
        res.json(doc);
    } catch (error) {
        console.error('!!! CRITICAL ERROR in getPortfolio !!!:', error);
        res.status(500).json({ message: 'Server failed to process the portfolio request.', error: error.message });
    }
};

// UPDATE Portfolio (Ismein call theek kar di gayi hai)
exports.updatePortfolio = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { bio, socialLinks, codingProfiles } = req.body || {};

        const doc = await Portfolio.findOne({ user: userId });

        if (!doc) {
            const created = await Portfolio.create({ user: userId, bio: bio || '', socialLinks: socialLinks || {}, codingProfiles: codingProfiles || {}, stats: {} });
            return res.json(created);
        }

        const prevProfiles = doc.codingProfiles || {};
        const nextProfiles = { ...prevProfiles, ...(codingProfiles || {}) };

        doc.bio = typeof bio === 'string' ? bio : doc.bio;
        doc.socialLinks = { ...(doc.socialLinks || {}), ...(socialLinks || {}) };
        doc.codingProfiles = nextProfiles;

        await doc.save();

        const changed = getChangedPlatforms(prevProfiles, nextProfiles);
        if (changed.length) {
            // --- FIX #2: Yahan sahi function ko call karein ---
            // Yeh function poora document leta hai aur use save karke wapas bhejta hai
            const updatedDocAfterSync = await syncPortfolioData(doc);
            return res.json(updatedDocAfterSync); // Updated document wapas bhejein
        }

        res.json(doc); // Agar kuch sync nahin hua to normal document bhejein
    } catch(error){
        console.error('!!! CRITICAL ERROR in updatePortfolio !!!:', error);
        res.status(500).json({ message: 'Server failed to update portfolio.', error: error.message });
    }
};

// SYNC Portfolio (Ismein bhi call theek kar di gayi hai)
exports.syncPortfolio = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const doc = await Portfolio.findOne({ user: userId });
        if (!doc) return res.status(404).json({ message: 'Portfolio not found' });

        // --- FIX #3: Yahan bhi sahi function ko call karein ---
        const updatedDoc = await syncPortfolioData(doc);

        return res.json(updatedDoc); // Updated document stats ke saath wapas bhejein
    } catch(error){
        console.error('!!! CRITICAL ERROR in syncPortfolio !!!:', error);
        res.status(500).json({ message: 'Server failed to sync portfolio.', error: error.message });
    }
};