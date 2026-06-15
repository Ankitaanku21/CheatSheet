const Semester = require('../models/Semester');

const getSemesters = async (req, res) => {
  try {
    const { branch, college } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (college) filter.college = college;
    const semesters = await Semester.find(filter).populate('branch', 'name code').populate('college', 'name type code').sort('displayOrder');
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('branch', 'name code').populate('college', 'name type code');
    if (!semester) return res.status(404).json({ message: 'Semester not found' });
    res.json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSemester = async (req, res) => {
  try {
    const { name, code, branch, year, displayOrder, college } = req.body;
    if (req.user.college?.toString() !== college && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create semesters for your own college' });
    }
    const existing = await Semester.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, branch });
    if (existing) return res.status(400).json({ message: 'A semester with this name already exists in this branch' });
    const semester = await Semester.create({ name, code, branch, year, displayOrder, college });
    res.status(201).json(semester);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Duplicate semester' });
    res.status(500).json({ message: error.message });
  }
};

const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!semester) return res.status(404).json({ message: 'Semester not found' });
    res.json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) return res.status(404).json({ message: 'Semester not found' });
    await require('../models/Subject').deleteMany({ semester: semester._id });
    res.json({ message: 'Semester removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester };
