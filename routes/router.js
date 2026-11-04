const express = require('express');
const router = express.Router();
const { CreateCustomer, getCustomers } = require('../controllers/customerController');
const { CreateInvoice, GetInvoices , GetInvoiceById  } = require('../controllers/invoiceController');


// Customer routes
router.post('/api/customers', CreateCustomer);
router.get('/api/customers', getCustomers);


// Invoice routes
router.post('/api/invoices', CreateInvoice);
router.get('/api/invoices', GetInvoices);
router.get('/api/invoices/:id', GetInvoiceById);


module.exports = router;