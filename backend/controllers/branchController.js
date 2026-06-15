const Branch = require('../models/Branch');
const Semester = require('../models/Semester');

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

const getBranches = async (req, res) => {
  try {
    const { college } = req.query;
    const filter = {};
    if (college) filter.college = college;
    const branches = await Branch.find(filter).populate('college', 'name type code').sort('name');
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('college', 'name type code');
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBranch = async (req, res) => {
  try {
    const { name, code, image, college } = req.body;
    if (req.user.college?.toString() !== college && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create branches for your own college' });
    }
    const existing = await Branch.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, college });
    if (existing) return res.status(400).json({ message: 'A branch with this name already exists in this college' });
    const branch = await Branch.create({ name, code, image, college });
    const semestersData = semesterDefs.map(s => ({ ...s, college, branch: branch._id }));
    await Semester.insertMany(semestersData);
    const populated = await Branch.findById(branch._id).populate('college', 'name type code');
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Duplicate branch name or code' });
    res.status(500).json({ message: error.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    await require('../models/Subject').deleteMany({ branch: branch._id });
    await require('../models/Semester').deleteMany({ branch: branch._id });
    await require('../models/Resource').deleteMany({ branch: branch._id });
    await require('../models/Question').deleteMany({ branch: branch._id });
    res.json({ message: 'Branch removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBranches, getBranchById, createBranch, updateBranch, deleteBranch };
