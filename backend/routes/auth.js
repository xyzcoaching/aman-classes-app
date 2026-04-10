const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // user find karo
    let user = await User.findOne({ email }).populate('studentId');

    // 🔥 agar user nahi mila → default admin create
    if (!user) {
      if (email === 'admin@amanclasses.com' && password === 'admin123') {
        user = new User({
          name: 'Admin',
          email: 'admin@amanclasses.com',
          password: 'admin123', // auto hash hoga (model me)
          role: 'admin',
        });

        await user.save();
      } else {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
    }

    // 🔥 password check (IMPORTANT FIX)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // token generate
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('studentId');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
