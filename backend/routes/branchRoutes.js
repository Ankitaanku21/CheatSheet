const express = require('express');
const { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', protect, createBranch);
router.put('/:id', protect, adminOnly, updateBranch);
router.delete('/:id', protect, adminOnly, deleteBranch);

module.exports = router;
