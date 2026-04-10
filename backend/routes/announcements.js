const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { targetClass } = req.query;
    const query = { isActive: true };
    if (targetClass && targetClass !== 'All') query.$or = [{ targetClass }, { targetClass: 'All' }];
    const announcements = await Announcement.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(announcements);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const ann = new Announcement({ ...req.body, postedBy: req.user.id });
    await ann.save();
    res.status(201).json(ann);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Announcement removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
