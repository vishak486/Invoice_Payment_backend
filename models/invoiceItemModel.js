const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0.01 },
    taxRate: { type: Number, required: true, min: 0, default: 0 },
    lineTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InvoiceItem', invoiceItemSchema);