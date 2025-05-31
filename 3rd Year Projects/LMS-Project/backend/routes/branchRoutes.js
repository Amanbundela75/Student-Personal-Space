const express = require('express');
const {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
} = require('../controllers/branchController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/')
    .get(getAllBranches) // Public
    .post(protect, authorize('admin'), createBranch); // Admin only

router.route('/:id')
    .get(getBranchById) // Public
    .put(protect, authorize('admin'), updateBranch) // Admin only
    .delete(protect, authorize('admin'), deleteBranch); // Admin only

module.exports = router;