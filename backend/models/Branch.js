const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  image: { type: String, default: '' }
}, { timestamps: true });

branchSchema.index({ college: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Branch', branchSchema);
