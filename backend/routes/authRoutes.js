const express = require('express');
const { registerUser, verifyEmail, loginUser, logoutUser, getMe, updateProfile, updateQuizStats, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/quiz-stats', protect, updateQuizStats);

module.exports = router;
