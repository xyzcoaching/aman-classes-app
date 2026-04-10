const router = require('express').Router();
const Schedule = require('../models/Schedule');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { class: cls, day } = req.query;
    const query = {};
    if (cls) query.class = cls;
    if (day) query.day = day;
    const schedules = await Schedule.find(query).sort({ startTime: 1 });
    res.json(schedules);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule entry removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
