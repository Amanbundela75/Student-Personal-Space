const express = require('express');
const router = express.Router();
const { getPortfolio, updatePortfolio, syncPortfolio } = require('../controllers/portfolioController');

// === यह है सही तरीका ===
// हम middleware फाइल से सीधे 'protect' function को निकाल रहे हैं।
const { protect } = require('../middleware/authMiddleware');

// अब हम 'protect' को middleware की तरह इस्तेमाल करेंगे।
router.get('/', protect, getPortfolio);

router.put('/', protect, updatePortfolio);

router.post('/sync', protect, syncPortfolio);

module.exports = router;