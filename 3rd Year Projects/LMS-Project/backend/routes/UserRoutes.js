const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
    getUserProfile,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    updateUserAcademics,
    addUserProject,
    updateUserProject,
    deleteUserProject,
    updateUserProfilePicture, // <-- 1. Controller ka naya naam import kiya
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

function checkFileType(file, cb) {
    // Allow all common image types
    const filetypes = /jpg|jpeg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (jpg, jpeg, png, gif, webp)'), false);
    }
}

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// --- Student Routes ---

router.route('/profile').get(protect, getUserProfile);

// --- UPDATE: Is route ko poori tarah se update kiya gaya hai ---
router.route('/profile/background')
    // 2. Multer ab 'profilePicture' key se file lega
    // 3. Naya controller function istemal hoga
    .put(upload.single('profilePicture'), updateUserProfilePicture);

router.route('/profile/academics').put(protect, updateUserAcademics);

router.route('/profile/projects')
    .post(protect, addUserProject);

router.route('/profile/projects/:projectId')
    .put(protect, updateUserProject)
    .delete(protect, deleteUserProject);

// --- Admin Routes ---
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).delete(protect, admin, deleteUser).put(protect, admin, updateUser);

module.exports = router;