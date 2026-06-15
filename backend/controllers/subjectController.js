const Subject = require('../models/Subject');
const Semester = require('../models/Semester');

const getSubjects = async (req, res) => {
  try {
    const { branch, semester, year, college } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);
    if (college) filter.college = college;
    const subjects = await Subject.find(filter)
      .populate('branch', 'name code')
      .populate('semester', 'name code')
      .populate('college', 'name type code')
      .sort('name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('branch', 'name code')
      .populate('semester', 'name code year')
      .populate('college', 'name type code');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, branch, semester, college } = req.body;
    if (req.user.college?.toString() !== college && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create subjects for your own college' });
    }
    const existing = await Subject.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }, branch
    });
    if (existing) return res.status(400).json({ message: 'A subject with this name already exists in this branch' });
    const sem = await Semester.findById(semester);
    const subject = await Subject.create({
      name, code, branch, semester, college,
      year: sem ? sem.year : undefined
    });
    const populated = await Subject.findById(subject._id)
      .populate('branch', 'name code')
      .populate('semester', 'name code')
      .populate('college', 'name type code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.semester) {
      const sem = await Semester.findById(updates.semester);
      updates.year = sem ? sem.year : undefined;
    }
    const subject = await Subject.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('branch', 'name code')
      .populate('semester', 'name code');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await require('../models/Resource').deleteMany({ subject: subject._id });
    await require('../models/Question').deleteMany({ subject: subject._id });
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
