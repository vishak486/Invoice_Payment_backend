const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0.01 },
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);