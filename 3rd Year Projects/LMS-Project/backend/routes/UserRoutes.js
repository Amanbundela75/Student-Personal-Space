const express = require('express');
const router = express.Router();
const {
    // Naya controller function import kiya hai
    getUserProfile,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// --- Student Route ---
// Yeh naya route hai. Koi bhi logged-in user (student ya admin)
// apni profile details yahan se fetch kar sakta hai.
// Ismein sirf 'protect' middleware laga hai, 'admin' nahi.
router.route('/profile').get(protect, getUserProfile);


// --- Admin Routes ---
// Yeh routes sirf admin ke liye hain.
// In par 'protect' aur 'admin' dono middleware lage hain.
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).delete(protect, admin, deleteUser).put(protect, admin, updateUser);

module.exports = router;