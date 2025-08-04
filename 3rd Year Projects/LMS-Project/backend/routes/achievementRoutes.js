const express = require('express');
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware.js');
const {
    getAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement
} = require('../controllers/achievementController.js');

const router = express.Router();

// --- Multer Configuration for Achievement Media ---
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Files 'uploads' folder mein save hongi.
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // File ka naam unique banane ke liye.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `achievement-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Function to check file type (image or video)
function checkFileType(file, cb) {
    // Allowed image types
    const imageTypes = /jpeg|jpg|png|gif/;
    // Allowed video types
    const videoTypes = /mp4|mov|avi|mkv/;

    const isImage = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const isVideo = videoTypes.test(path.extname(file.originalname).toLowerCase());

    if (isImage || isVideo) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only images (jpeg, jpg, png, gif) and videos (mp4, mov, avi, mkv) are allowed.'), false);
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 1024 * 1024 * 50 // 50 MB file size limit
    }
});

// --- Achievement Routes ---

// Route: /api/achievements/
// GET: Apne saare achievements fetch karna.
// POST: Naya achievement add karna (media file ke saath).
router.route('/')
    .get(protect, getAchievements)
    .post(protect, upload.single('media'), addAchievement);

// Route: /api/achievements/:id
// PUT: Ek specific achievement ko update karna.
// DELETE: Ek specific achievement ko delete karna.
router.route('/:id')
    .put(protect, upload.single('media'), updateAchievement)
    .delete(protect, deleteAchievement);

module.exports = router;