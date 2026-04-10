const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ✅ Root route (IMPORTANT FIX)
app.get('/', (req, res) => {
  res.send('Aman Classes Backend Running 🚀');
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aman Classes API running' });
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

module.exports = app;
