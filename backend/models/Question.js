const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  year: { type: Number },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  type: { type: String, enum: ['objective', 'subjective'], default: 'objective' },
  questionType: { type: String, enum: ['mcq', 'short', 'long'] },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number },
  expectedAnswer: { type: String },
  explanation: { type: String, default: '' },
  source: { type: String, enum: ['ai-generated', 'manual'], default: 'ai-generated' },
  timeLimit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);