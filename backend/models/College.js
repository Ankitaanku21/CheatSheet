const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['IIT', 'NIT', 'IIIT', 'Other'], required: true },
  code: { type: String, required: true, unique: true },
  image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
