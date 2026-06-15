const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      console.log('[UploadController] No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('[UploadController] Success:', req.file.filename, '- Size:', req.file.size, '- Path:', req.file.path);
    res.json({
      url: req.file.path,
      size: req.file.size,
      filename: req.file.filename,
    });
  } catch (error) {
    console.log('[UploadController] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadFile };
