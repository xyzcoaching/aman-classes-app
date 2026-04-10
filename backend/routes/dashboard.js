const router = require('express').Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Announcement = require('../models/Announcement');
const Schedule = require('../models/Schedule');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = days[now.getDay()];

    const [totalStudents, fees, announcements, todaySchedule, attRecords] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Fee.find({ month, year }).populate('student','name class'),
      Announcement.find({ isActive: true }).sort({ createdAt: -1 }).limit(5),
      Schedule.find({ day: todayName }).sort({ startTime: 1 }),
      Attendance.find({ date: { $gte: today, $lt: tomorrow } }),
    ]);

    const collected = fees.filter(f=>f.status==='paid').reduce((s,f)=>s+f.paidAmount,0);
    const pendingCount = fees.filter(f=>f.status!=='paid').length;

    const presentSet = new Set();
    attRecords.forEach(r => r.records.forEach(x => { if(x.status==='present') presentSet.add(x.student.toString()); }));

    res.json({
      totalStudents,
      todayAttendance: presentSet.size,
      feesCollected: collected,
      pendingFees: pendingCount,
      announcements,
      todaySchedule,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
