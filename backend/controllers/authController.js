const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { findOrCreateCollege } = require('./collegeController');
const sendEmail = require('../utils/sendEmail');
const verifyGoogleToken = require('../utils/verifyGoogleToken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, college } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    let collegeId;
    if (typeof college === 'string') {
      collegeId = college;
    } else if (college && typeof college === 'object') {
      const result = await findOrCreateCollege(college);
      collegeId = result._id;
    }
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, college: collegeId, verificationToken });
    const baseUrl = process.env.VERIFICATION_URL || 'http://localhost:5173';
    const verifyLink = `${baseUrl}/verify/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your email — CheatSheet',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#4f46e5;">Welcome to CheatSheet!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyLink}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:16px;margin:16px 0;">Verify Email</a>
        <p style="color:#6b7280;font-size:13px;">Or copy this link: <br/>${verifyLink}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
        <p style="color:#9ca3af;font-size:12px;">If you did not sign up, please ignore this email.</p>
      </div>`,
    });
    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (error) {
    if (error.message && error.message.includes('verify')) {
      return res.status(500).json({ message: 'Account created but failed to send verification email. Please contact support.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });
    user.isVerified = true;
    user.verificationToken = '';
    await user.save();
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('college', 'name type code');
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'This email is registered with Google. Please login with Google.' });
    }
    const matched = await user.matchPassword(password);
    if (!matched) return res.status(400).json({ message: 'Invalid email or password' });
    if (!user.isVerified) {
      if (!user.verificationToken) {
        user.isVerified = true;
        await user.save();
      } else {
        return res.status(400).json({ message: 'Please verify your email before logging in. Check your inbox.' });
      }
    }
    const token = generateToken(user._id);
    res.cookie('token', token, { httpOnly: true, maxAge: 1 * 24 * 60 * 60 * 1000 });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      college: user.college, branch: user.branch, role: user.role,
      avatar: user.avatar, quizStats: user.quizStats, token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('college', 'name type code')
      .populate('branch', 'name code')
      .populate('savedResources');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, college, branch, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (college) {
      let collegeId;
      if (typeof college === 'string') {
        collegeId = college;
      } else if (college && typeof college === 'object') {
        const result = await findOrCreateCollege(college);
        collegeId = result._id;
      }
      user.college = collegeId;
    }
    if (branch) user.branch = branch;
    if (avatar) user.avatar = avatar;
    const updated = await user.save();
    const populated = await User.findById(updated._id).populate('college', 'name type code');
    res.json({
      _id: populated._id, name: populated.name, email: populated.email,
      college: populated.college, branch: populated.branch, role: populated.role,
      avatar: populated.avatar, quizStats: populated.quizStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuizStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { score, totalQuestions } = req.body;
    const totalScore = +(score || 0);
    user.quizStats.totalQuizzes += 1;
    user.quizStats.totalCorrect = Math.round((user.quizStats.totalCorrect + totalScore) * 10) / 10;
    user.quizStats.totalAttempted += totalQuestions || 0;
    user.quizStats.averageScore = user.quizStats.totalAttempted > 0
      ? Math.round((user.quizStats.totalCorrect / user.quizStats.totalAttempted) * 100)
      : 0;
    const acc = user.quizStats.averageScore;
    const tq = user.quizStats.totalQuizzes;
    if (acc >= 90 && tq >= 20) user.quizStats.rating = 5;
    else if (acc >= 75 && tq >= 10) user.quizStats.rating = 4;
    else if (acc >= 60 && tq >= 5) user.quizStats.rating = 3;
    else if (acc >= 40 && tq >= 3) user.quizStats.rating = 2;
    else if (acc >= 20 && tq >= 1) user.quizStats.rating = 1;
    else user.quizStats.rating = 0;
    await user.save();
    res.json(user.quizStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });

    const payload = await verifyGoogleToken(credential);
    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email }).populate('college', 'name type code');

    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId: sub,
        authProvider: 'google',
        avatar: picture || '',
        isVerified: true,
      });
      user = await User.findById(user._id).populate('college', 'name type code');
    }

    const token = generateToken(user._id);
    res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      college: user.college, branch: user.branch, role: user.role,
      avatar: user.avatar, quizStats: user.quizStats, token
    });
  } catch (error) {
    if (error.message && error.message.includes('Token used too late')) {
      return res.status(400).json({ message: 'Google token expired. Please try again.' });
    }
    if (error.message && error.message.includes('Invalid token')) {
      return res.status(400).json({ message: 'Invalid Google token.' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyEmail, loginUser, logoutUser, getMe, updateProfile, updateQuizStats, googleAuth };