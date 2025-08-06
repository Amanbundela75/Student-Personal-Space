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
    updateUserProfilePicture,
    // NEW: Import certification controllers
    getCertifications,
    addCertification,
    deleteCertification,
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // All user-related files go into 'uploads/'
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- UPDATED: This function is now more robust for checking file types ---
function checkFileType(file, cb) {
    // Define allowed file extensions
    const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf/;
    // Check if the file's extension is in our allowed list
    const isExtensionAllowed = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    // Define allowed MIME types (the "true" type of the file)
    const allowedMimeTypes = /image|application\/pdf/;
    // Check if the file's MIME type is in our allowed list
    const isMimeTypeAllowed = allowedMimeTypes.test(file.mimetype);

    // If both checks pass, allow the file
    if (isExtensionAllowed && isMimeTypeAllowed) {
        return cb(null, true);
    } else {
        // If either check fails, reject the file
        cb(new Error('Invalid file type! Only images (JPG, PNG, etc.) and PDF files are allowed.'), false);
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

router.route('/profile/background')
    .put(protect, upload.single('profilePicture'), updateUserProfilePicture);

router.route('/profile/academics').put(protect, updateUserAcademics);

router.route('/profile/projects')
    .post(protect, addUserProject);

router.route('/profile/projects/:projectId')
    .put(protect, updateUserProject)
    .delete(protect, deleteUserProject);

// --- Certification Routes ---
router.route('/profile/certifications')
    .get(protect, getCertifications)
    .post(protect, upload.single('certificateFile'), addCertification);

router.route('/profile/certifications/:certId')
    .delete(protect, deleteCertification);


// --- Admin Routes ---
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).delete(protect, admin, deleteUser).put(protect, admin, updateUser);

module.exports = router;