const mongoose = require('mongoose');
const Invoice = require('../models/invoiceModel');
const InvoiceItem = require('../models/invoiceItemModel');
const Customer = require('../models/customerModel');
const Payment = require('../models/paymentModel');

// round to 2 decimals
const round = (n) => Math.round(n * 100) / 100;

// POST /api/invoices
exports.CreateInvoice = async (req, res) => {
    console.log("Inside CreateInvoice");
    try {
        const { invoiceNumber, customer, invoiceDate, dueDate, items } = req.body;

        if (!invoiceNumber || !customer || !dueDate) {
            return res.status(400).json({ message: 'Invoice number, customer and due date are required' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        const existingCustomer = await Customer.findById(customer);
        if (!existingCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // server calculates line totals and invoice total
        let total = 0;
        const itemsData = [];
        for (const item of items) {
            const { description, quantity, unitPrice, taxRate = 0 } = item;

            if (!description || !(quantity > 0) || !(unitPrice > 0) || taxRate < 0) {
                return res.status(400).json({
                    message: 'Each item needs a description, quantity > 0, unit price > 0 and tax rate >= 0'
                });
            }

            const lineTotal = round(quantity * unitPrice * (1 + taxRate / 100));
            total += lineTotal;
            itemsData.push({ description, quantity, unitPrice, taxRate, lineTotal });
        }
        total = round(total);

        const invoice = await Invoice.create({ invoiceNumber, customer, invoiceDate, dueDate, total });

        const savedItems = await InvoiceItem.insertMany(
            itemsData.map((i) => ({ ...i, invoice: invoice._id }))
        );

        res.status(201).json({ invoice, items: savedItems });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Invoice number already exists' });
        }
        res.status(500).json({ message: err.message });
    }
};


// GET /api/invoices  (optional filter: ?status=unpaid)
exports.GetInvoices = async (req, res) => {
    console.log("Inside GetInvoices");
    try {
        const { status } = req.query;
        const filter = {};

        if (status) {
            if (!['unpaid', 'partly_paid', 'paid'].includes(status)) {
                return res.status(400).json({ message: 'Status must be unpaid, partly_paid or paid' });
            }
            filter.status = status;
        }

        const invoices = await Invoice.find(filter)
            .populate('customer', 'name email phone')
            .sort({ createdAt: -1 });

        // total paid per invoice
        const paidList = await Payment.aggregate([
            { $group: { _id: '$invoice', amountPaid: { $sum: '$amount' } } }
        ]);
        const paidMap = {};
        paidList.forEach((p) => {
            paidMap[p._id.toString()] = p.amountPaid;
        });

        const result = invoices.map((inv) => {
            const amountPaid = paidMap[inv._id.toString()] || 0;
            return {
                ...inv.toObject(),
                amountPaid: round(amountPaid),
                balanceDue: round(inv.total - amountPaid),
            };
        });

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/invoices/:id
exports.GetInvoiceById = async (req, res) => {
    console.log("Inside GetInvoiceById");
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid invoice id' });
        }

        const invoice = await Invoice.findById(id).populate('customer', 'name email phone');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const items = await InvoiceItem.find({ invoice: id });
        const payments = await Payment.find({ invoice: id }).sort({ paymentDate: 1 });

        const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        res.status(200).json({
            ...invoice.toObject(),
            items,
            payments,
            amountPaid: round(amountPaid),
            balanceDue: round(invoice.total - amountPaid),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
