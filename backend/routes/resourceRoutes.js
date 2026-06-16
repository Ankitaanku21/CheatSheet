const express = require('express');
const {
  getResources, getResourceById, createResource,
  viewResource, downloadResource, likeResource,
  updateResource, deleteResource, saveResource, getBookmarks,
  streamResourceFile
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getResources);
router.get('/user/bookmarks', protect, getBookmarks);
router.get('/:id/file', protect, streamResourceFile);
router.get('/:id', getResourceById);
router.post('/', protect, createResource);
router.put('/:id/view', protect, viewResource);
router.put('/:id/download', protect, downloadResource);
router.put('/:id/like', protect, likeResource);
router.put('/:id/save', protect, saveResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.get('/user/bookmarks', protect, getBookmarks);

module.exports = router;
