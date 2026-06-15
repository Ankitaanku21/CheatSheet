const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  isCorrect: { type: mongoose.Schema.Types.Mixed, default: null },
  marksAwarded: { type: Number, default: null },
  maxMarks: { type: Number, default: 1 },
  aiFeedback: { type: String, default: '' },
  aiEvaluated: { type: Boolean, default: false }
});

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  mcqScore: { type: Number, default: 0 },
  subjectiveScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: '' },
  answers: [answerSchema],
  timeTaken: { type: Number, default: 0 }
}, { timestamps: true });

quizAttemptSchema.index({ user: 1, resource: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
