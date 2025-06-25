const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Ye saare routes protect aur admin middleware se guzrenge
router.use(protect);
router.use(admin);

router.route('/').get(getUsers);
router.route('/:id').get(getUserById).delete(deleteUser).put(updateUser);

module.exports = router;