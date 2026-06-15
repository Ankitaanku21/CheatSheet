const express = require('express');
const { extractText, getSummary, getTopics, askQuestion } = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:resourceId/extract-text', protect, extractText);
router.get('/:resourceId/summary', protect, getSummary);
router.get('/:resourceId/topics', protect, getTopics);
router.post('/:resourceId/ask', protect, askQuestion);

module.exports = router;
