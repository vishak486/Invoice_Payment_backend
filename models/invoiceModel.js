const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['unpaid', 'partly_paid', 'paid'],
      default: 'unpaid',
    },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);