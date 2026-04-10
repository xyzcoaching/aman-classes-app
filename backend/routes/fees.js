const router = require('express').Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { auth, adminOnly } = require('../middleware/auth');

// Get fees - all or filtered
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, status, studentId } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;
    if (studentId) query.student = studentId;

    const fees = await Fee.find(query).populate('student', 'name class rollNumber monthlyFee').sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Monthly summary
router.get('/summary', auth, async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const fees = await Fee.find({ month, year });
    const collected = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.paidAmount, 0);
    const partial = fees.filter(f => f.status === 'partial').reduce((s, f) => s + f.paidAmount, 0);
    const pending = fees.filter(f => f.status === 'pending' || f.status === 'partial').length;
    const totalStudents = await Student.countDocuments({ isActive: true });

    res.json({ collected, partial, pending, totalStudents, month, year, totalRecords: fees.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record fee payment
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { studentId, month, year, paidAmount } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const fee = await Fee.findOneAndUpdate(
      { student: studentId, month, year },
      { student: studentId, month, year, amount: student.monthlyFee, paidAmount, remarks: req.body.remarks },
      { upsert: true, new: true, runValidators: true }
    );

    // Update student fee status
    await Student.findByIdAndUpdate(studentId, { feeStatus: fee.status });

    res.json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get receipt
router.get('/:id/receipt', auth, async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('student');
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
