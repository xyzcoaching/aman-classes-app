const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  class: { type: String, required: true },
  day: { type: String, required: true, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
  subject: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  teacher: { type: String, default: 'Aman Sir' },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
