const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { uploadAvatar } = require('../controllers/avatarController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: require('cloudinary').v2,
  params: {
    folder: 'cheatsheet/avatars',
    allowed_formats: ['jpeg', 'png', 'gif', 'webp'],
    max_bytes: 5 * 1024 * 1024,
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF, and WebP images allowed. Got: ' + file.mimetype), false);
    }
  },
});

router.post('/', protect, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Max 5MB allowed.' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
}, uploadAvatar);

module.exports = router;
