const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { auth, adminOnly } = require('../middleware/auth');

// Get attendance for a date + class + subject
router.get('/', auth, async (req, res) => {
  try {
    const { date, class: cls, subject } = req.query;
    const query = {};
    if (date) query.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    if (cls) query.class = cls;
    if (subject) query.subject = subject;

    const records = await Attendance.find(query).populate('records.student', 'name rollNumber');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly attendance stats for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      date: { $gte: start, $lt: end },
      'records.student': req.params.studentId,
    });

    const stats = { present: 0, absent: 0, late: 0, total: records.length };
    records.forEach(r => {
      const rec = r.records.find(x => x.student.toString() === req.params.studentId);
      if (rec) stats[rec.status]++;
    });

    res.json({ stats, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's attendance summary
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const records = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    const presentSet = new Set();
    const absentSet = new Set();
    records.forEach(r => {
      r.records.forEach(x => {
        if (x.status === 'present') presentSet.add(x.student.toString());
        else absentSet.add(x.student.toString());
      });
    });

    const total = await Student.countDocuments({ isActive: true });
    res.json({ present: presentSet.size, absent: absentSet.size, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark/update attendance
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { date, class: cls, subject, records } = req.body;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { date: d, class: cls, subject },
      { date: d, class: cls, subject, records, markedBy: req.user.id },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
