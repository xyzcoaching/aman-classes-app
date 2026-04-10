// routes/materials.js
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const { auth, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_, f, cb) => {
  cb(null, f.mimetype === 'application/pdf' || f.mimetype.startsWith('image/'));
}});

router.get('/', auth, async (req, res) => {
  try {
    const { subject, class: cls } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (cls) query.class = cls;
    const materials = await Material.find(query).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, upload.single('file'), async (req, res) => {
  try {
    const material = new Material({
      ...req.body,
      fileName: req.file ? req.file.filename : 'sample.pdf',
      fileSize: req.file ? req.file.size : 0,
      uploadedBy: req.user.id,
    });
    await material.save();
    res.status(201).json(material);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
