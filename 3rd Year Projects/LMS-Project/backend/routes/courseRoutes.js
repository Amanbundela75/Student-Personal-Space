const express = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideoToCourse,
    addNoteToCourse,
    getEnrolledCourses,
    deleteVideoFromCourse, // <-- Naya function import karein
    deleteNoteFromCourse   // <-- Naya function import karein
} = require('../controllers/courseController.js');
const { protect, authorize, admin } = require('../middleware/authMiddleware.js');
const { uploadNoteFile } = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.route('/')
    .get(getAllCourses)
    .post(protect, admin, createCourse);

router.route('/my-courses')
    .get(protect, authorize('student'), getEnrolledCourses);

router.route('/:id')
    .get(getCourseById)
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

// --- Content Routes ---
router.route('/:id/videos')
    .post(protect, admin, addVideoToCourse);
router.route('/:id/notes')
    .post(protect, admin, uploadNoteFile.single('noteFile'), addNoteToCourse);

// === NAYE DELETE ROUTES YAHAN ADD KIYE GAYE HAIN ===
router.route('/:courseId/videos/:videoId')
    .delete(protect, admin, deleteVideoFromCourse);
router.route('/:courseId/notes/:noteId')
    .delete(protect, admin, deleteNoteFromCourse);
// =================================================

module.exports = router;