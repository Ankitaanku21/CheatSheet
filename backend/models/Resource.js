const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['notes', 'pyq'], required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  year: { type: Number },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  extractedText: { type: String, default: null },
  aiSummary: { type: String, default: null },
  aiTopics: [{ type: String }],
  aiSummaryGeneratedAt: { type: Date },
  aiTopicsGeneratedAt: { type: Date }
}, { timestamps: true });

resourceSchema.index({ branch: 1, year: 1, subject: 1, type: 1 });
resourceSchema.index({ branch: 1, semester: 1, subject: 1, type: 1 });
resourceSchema.index({ college: 1, subject: 1, type: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
