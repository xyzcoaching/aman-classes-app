const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  class: { type: String, required: true, enum: ['6', '7', '8', '9', '10'] },
  subjects: [{ type: String, enum: ['Physics', 'Chemistry', 'Mathematics', 'Computer'] }],
  parentPhone: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  monthlyFee: { type: Number, required: true },
  feeStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
  rollNumber: { type: String, unique: true },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate roll number
studentSchema.pre('save', async function (next) {
  if (!this.rollNumber) {
    const count = await mongoose.model('Student').countDocuments();
    this.rollNumber = `AC${new Date().getFullYear()}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
