const express = require('express');
const { getColleges, getCollegeById, createCollege, updateCollege, deleteCollege } = require('../controllers/collegeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.post('/', protect, adminOnly, createCollege);
router.put('/:id', protect, adminOnly, updateCollege);
router.delete('/:id', protect, adminOnly, deleteCollege);

module.exports = router;
