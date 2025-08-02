const express = require('express');
const router = express.Router();
const {
    // Puraane controllers
    getUserProfile,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,

    // --- DASHBOARD KE LIYE NAYE CONTROLLERS ---
    updateUserAcademics,
    addUserProject,
    updateUserProject,
    deleteUserProject,
    // ----------------------------------------

} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// --- Student Routes ---

// Profile fetch karne ka route
router.route('/profile').get(protect, getUserProfile);

// Academics update karne ka route
router.route('/profile/academics').put(protect, updateUserAcademics);

// Projects ko manage karne ke routes
router.route('/profile/projects')
    .post(protect, addUserProject); // Naya project add karna

router.route('/profile/projects/:projectId')
    .put(protect, updateUserProject) // Project update karna
    .delete(protect, deleteUserProject); // Project delete karna


// --- Admin Routes ---
// Yeh routes sirf admin ke liye hain.
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).delete(protect, admin, deleteUser).put(protect, admin, updateUser);

module.exports = router;