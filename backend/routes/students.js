const router = require('express').Router();
const Student = require('../models/Student');
const { auth, adminOnly } = require('../middleware/auth');

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const { class: cls, search, feeStatus } = req.query;
    const query = { isActive: true };
    if (cls) query.class = cls;
    if (feeStatus) query.feeStatus = feeStatus;
    if (search) query.name = { $regex: search, $options: 'i' };

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single student
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create student
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student (soft delete)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
