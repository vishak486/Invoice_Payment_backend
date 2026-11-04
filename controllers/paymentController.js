const mongoose = require('mongoose');
const Invoice = require('../models/invoiceModel');
const Payment = require('../models/paymentModel');

// round to 2 decimals
const round = (n) => Math.round(n * 100) / 100;

// POST /api/payments
exports.CreatePayment = async (req, res) => {
    console.log("Inside CreatePayment");
    const session = await mongoose.startSession();
    try {
        const { invoice, paymentDate, amount, method } = req.body;
        const amt = Number(amount);

        // basic validation
        if (!invoice || !method || amount === undefined || amount === '') {
            return res.status(400).json({ message: 'Invoice, amount and method are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(invoice)) {
            return res.status(400).json({ message: 'Invalid invoice id' });
        }
        if (!['cash', 'bank_transfer', 'upi'].includes(method)) {
            return res.status(400).json({ message: 'Method must be cash, bank_transfer or upi' });
        }
        if (!(amt > 0)) {
            return res.status(400).json({ message: 'Payment amount must be greater than zero' });
        }

        let result;

        // saving the payment and updating the status: both succeed or both fail
        await session.withTransaction(async () => {
            const inv = await Invoice.findById(invoice).session(session);
            if (!inv) {
                throw { status: 404, message: 'Invoice not found' };
            }

            const payments = await Payment.find({ invoice }).session(session);
            const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const balanceDue = round(inv.total - amountPaid);

            if (amt > balanceDue) {
                throw { status: 400, message: `Payment is more than the balance due. Balance due is ${balanceDue}` };
            }

            const [payment] = await Payment.create(
                [{ invoice, paymentDate, amount: amt, method }],
                { session }
            );

            const newPaid = round(amountPaid + amt);
            inv.status = newPaid >= inv.total ? 'paid' : 'partly_paid';
            await inv.save({ session });

            result = {
                payment,
                status: inv.status,
                amountPaid: newPaid,
                balanceDue: round(inv.total - newPaid),
            };
        });

        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    } finally {
        session.endSession();
    }
};