const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, default: '' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  savedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  quizStats: {
    totalQuizzes: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
