const express = require('express');
const router = express.Router();
const { CreateCustomer, getCustomers } = require('../controllers/customerController');

// Customer routes
router.post('/api/customers', CreateCustomer);
router.get('/api/customers', getCustomers);

module.exports = router;