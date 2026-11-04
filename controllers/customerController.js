const Customer = require('../models/customerModel');

// POST /api/customers

exports.CreateCustomer = async (req, res) => {
    console.log("Inside CreateCustomer");
    try {
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email and phone are required' });
        }
        const customer = await Customer.create({ name, email, phone });
        res.status(201).json(customer);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

// GET /api/customers

exports.getCustomers = async (req, res) => {
    console.log("Inside getCustomers");
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.status(200).json(customers);
    } catch (err) {
        res.status(500).json(err);
    }
};

