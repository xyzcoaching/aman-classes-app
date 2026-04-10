const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
  paidDate: { type: Date },
  receiptNumber: { type: String, unique: true, sparse: true },
  remarks: { type: String },
}, { timestamps: true });

feeSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

feeSchema.pre('save', function (next) {
  if (this.paidAmount >= this.amount) this.status = 'paid';
  else if (this.paidAmount > 0) this.status = 'partial';
  else this.status = 'pending';

  if (this.status === 'paid' && !this.receiptNumber) {
    this.receiptNumber = `RC${Date.now()}`;
    this.paidDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
