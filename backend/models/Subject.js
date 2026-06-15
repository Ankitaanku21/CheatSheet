const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, default: '' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  year: { type: Number }
}, { timestamps: true });

subjectSchema.index({ branch: 1, semester: 1 });
subjectSchema.index({ branch: 1, year: 1 });
subjectSchema.index({ college: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
