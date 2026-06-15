const Resource = require('../models/Resource');

const getResources = async (req, res) => {
  try {
    const { branch, year, subject, type, search, college, semester } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (college) filter.college = college;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);
    if (subject) filter.subject = subject;
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name avatar')
      .populate('subject', 'name')
      .sort('-createdAt');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name avatar');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, type, branch, year, semester, subject, fileUrl, fileSize, college } = req.body;
    if (college && req.user.college?.toString() !== college) {
      return res.status(403).json({ message: 'You can only upload resources for your own college' });
    }
    const resource = await Resource.create({
      title, type, branch, year, semester, subject, college,
      fileUrl, fileSize, uploadedBy: req.user._id
    });
    const populated = await Resource.findById(resource._id)
      .populate('uploadedBy', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const viewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    resource.views += 1;
    await resource.save();
    res.json({ fileUrl: resource.fileUrl, views: resource.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    resource.downloads += 1;
    await resource.save();
    res.json({ fileUrl: resource.fileUrl, downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const idx = resource.likes.indexOf(req.user._id);
    if (idx > -1) resource.likes.splice(idx, 1);
    else resource.likes.push(req.user._id);
    await resource.save();
    res.json({ likes: resource.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const resources = await Resource.find({ _id: { $in: user.savedResources } })
      .populate('uploadedBy', 'name avatar')
      .populate('subject', 'name');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveResource = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const idx = user.savedResources.indexOf(req.params.id);
    if (idx > -1) user.savedResources.splice(idx, 1);
    else user.savedResources.push(req.params.id);
    await user.save();
    res.json({ saved: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResources, getResourceById, createResource,
  viewResource, downloadResource, likeResource,
  deleteResource, saveResource, getBookmarks
};
