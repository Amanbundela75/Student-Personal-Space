const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to ensure a directory exists
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// --- 1. Storage Configuration for ID Cards (for Registration) ---
const idCardStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/idCards/';
        ensureDirExists(dir); // Make sure the directory exists
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `idCard-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// --- 2. Storage Configuration for Note Files (e.g., PDFs) ---
const noteFileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/notes/';
        ensureDirExists(dir); // Make sure the directory exists
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `note-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// --- 3. Storage Configuration for Roadmap Profile Images ---
const roadmapImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/seniors/';
        ensureDirExists(dir); // Make sure the directory exists
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `senior-${Date.now()}${path.extname(file.originalname)}`);
    }
});


// --- A more flexible File Filter to accept both images and documents ---
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedDocumentTypes = /pdf|doc|docx|ppt|pptx|txt/;

    const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const isDocument = allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());

    // Check the fieldname to decide which file types are allowed
    if (file.fieldname === 'noteFile') {
        if (isImage || isDocument) {
            return cb(null, true); // Allow images and documents for notes
        }
    } else { // For idCardImage, profileImage, etc.
        if (isImage) {
            return cb(null, true); // Allow only images for other uploads
        }
    }

    cb(new Error('Invalid file type.'), false);
};


// --- Create separate Multer upload instances for each use case ---
const uploadIdCard = multer({ storage: idCardStorage, fileFilter: fileFilter });
const uploadNoteFile = multer({ storage: noteFileStorage, fileFilter: fileFilter });
const uploadRoadmapImage = multer({ storage: roadmapImageStorage, fileFilter: fileFilter });


// Export all of them in an object
module.exports = {
    uploadIdCard,
    uploadNoteFile,
    uploadRoadmapImage,
};