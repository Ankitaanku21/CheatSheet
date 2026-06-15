const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  year: { type: Number, required: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

semesterSchema.index({ branch: 1, displayOrder: 1 });
semesterSchema.index({ college: 1, displayOrder: 1 });

module.exports = mongoose.model('Semester', semesterSchema);
