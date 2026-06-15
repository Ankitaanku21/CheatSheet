const express = require('express');
const {
  getQuestions, getQuestionsForQuiz, getQuestionById, createQuestion,
  generateQuestions, generateSubjectQuizController, submitQuiz,
  getAttempts, getAttemptById, migrateAttempts, getLeaderboard
} = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/questions', getQuestions);
router.get('/questions/quiz', getQuestionsForQuiz);
router.get('/questions/:id', getQuestionById);
router.post('/questions', protect, adminOnly, createQuestion);
router.post('/generate', protect, generateQuestions);
router.post('/generate-subject', protect, generateSubjectQuizController);
router.post('/submit', protect, submitQuiz);
router.post('/migrate', protect, adminOnly, migrateAttempts);
router.get('/attempts', protect, getAttempts);
router.get('/attempts/:id', protect, getAttemptById);
router.get('/leaderboard', getLeaderboard);

module.exports = router;