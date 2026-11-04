const express = require('express');
const router = express.Router();
const { CreateCustomer, getCustomers } = require('../controllers/customerController');
const { CreateInvoice, GetInvoices , GetInvoiceById  } = require('../controllers/invoiceController');
const { CreatePayment } = require('../controllers/paymentController');


// Customer routes
router.post('/api/customers', CreateCustomer);
router.get('/api/customers', getCustomers);


// Invoice routes
router.post('/api/invoices', CreateInvoice);
router.get('/api/invoices', GetInvoices);
router.get('/api/invoices/:id', GetInvoiceById);

router.post('/api/payments', CreatePayment);



module.exports = router;