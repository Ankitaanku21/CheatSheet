const College = require('../models/College');
const Branch = require('../models/Branch');
const Semester = require('../models/Semester');

const generateCode = (name) => {
  const words = name.trim().split(/\s+/);
  let code = words.map(w => w[0].toUpperCase()).join('').slice(0, 6);
  if (code.length < 2) code = name.trim().slice(0, 3).toUpperCase();
  return code;
};

const defaultBranches = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Electronics & Communication Engineering', code: 'ECE' },
  { name: 'Electrical Engineering', code: 'EE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CE' },
];

const semesterDefs = [
  { name: 'Semester I', code: 'SEM1', year: 1, displayOrder: 1 },
  { name: 'Semester II', code: 'SEM2', year: 1, displayOrder: 2 },
  { name: 'Semester III', code: 'SEM3', year: 2, displayOrder: 3 },
  { name: 'Semester IV', code: 'SEM4', year: 2, displayOrder: 4 },
  { name: 'Semester V', code: 'SEM5', year: 3, displayOrder: 5 },
  { name: 'Semester VI', code: 'SEM6', year: 3, displayOrder: 6 },
  { name: 'Semester VII', code: 'SEM7', year: 4, displayOrder: 7 },
  { name: 'Semester VIII', code: 'SEM8', year: 4, displayOrder: 8 },
];

const findOrCreateCollege = async (data) => {
  if (typeof data === 'string') {
    return College.findById(data);
  }
  const { name, type } = data;
  if (!name || !type) throw new Error('College name and type are required');
  const existing = await College.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
  if (existing) return existing;
  let code = generateCode(name);
  const codeExists = await College.findOne({ code });
  if (codeExists) code = code + Math.floor(Math.random() * 100);
  const college = await College.create({ name, type, code });
  const branches = defaultBranches.map(b => ({ ...b, college: college._id }));
  const createdBranches = await Branch.insertMany(branches);
  const semesters = [];
  for (const branch of createdBranches) {
    semesterDefs.forEach(s => {
      semesters.push({ ...s, college: college._id, branch: branch._id });
    });
  }
  await Semester.insertMany(semesters);
  return college;
};

const getColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort('name');
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCollege = async (req, res) => {
  try {
    const { name, type, code, image } = req.body;
    const existing = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'A college with this name already exists' });
    const college = await College.create({ name, type, code, image });
    res.status(201).json(college);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Duplicate college name or code' });
    res.status(500).json({ message: error.message });
  }
};

const updateCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json({ message: 'College removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getColleges, getCollegeById, createCollege, updateCollege, deleteCollege, findOrCreateCollege };
