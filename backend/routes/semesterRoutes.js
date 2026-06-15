const express = require('express');
const {
  getSemesters, getSemesterById, createSemester,
  updateSemester, deleteSemester
} = require('../controllers/semesterController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getSemesters);
router.get('/:id', getSemesterById);
router.post('/', protect, createSemester);
router.put('/:id', protect, adminOnly, updateSemester);
router.delete('/:id', protect, adminOnly, deleteSemester);

module.exports = router;
