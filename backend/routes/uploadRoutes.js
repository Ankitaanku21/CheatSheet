const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: require('cloudinary').v2,
  params: {
    folder: 'cheatsheet/resources',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'docx'],
    max_bytes: 20 * 1024 * 1024,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files allowed. Got: ' + file.mimetype), false);
    }
  },
});

router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Max 20MB allowed.' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
}, uploadFile);

module.exports = router;
