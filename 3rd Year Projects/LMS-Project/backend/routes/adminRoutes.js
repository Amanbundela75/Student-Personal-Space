const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    deleteUserByAdmin
} = require('../controllers/adminController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// All routes in this file are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/users').get(getAllUsers);
router.route('/users/:id')
    .get(getUserById)
    .put(updateUserByAdmin)
    .delete(deleteUserByAdmin);

// Add other admin-specific routes here, e.g., for platform statistics, content management etc.

module.exports = router;