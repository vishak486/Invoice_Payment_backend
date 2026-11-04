# Invoice & Payments App: Backend

REST API for a small Invoices and Payments app. A business creates invoices for customers, records full or part payments, and sees what each customer still owes.

**Tech:** Node.js, Express, MongoDB Atlas, Mongoose

## Setup

1. Install packages
   ```
   npm install
   ```
2. Create a `.env` file in the backend folder
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   ```
3. Start the server
   ```
   nodemon index.js
   ```
   or `node index.js`. The server runs on `http://localhost:5000`.

## Folder structure

```
database/dbConnection.js     MongoDB Atlas connection
models/                      Customer, Invoice, InvoiceItem, Payment
controllers/                 customer, invoice and payment logic
routes/router.js             all API routes
index.js                     server entry point
```

## Collections

| Collection | Fields |
|---|---|
| customers | name, email, phone |
| invoices | invoiceNumber (unique), customer, invoiceDate, dueDate, status, total |
| invoiceitems | invoice, description, quantity, unitPrice, taxRate, lineTotal |
| payments | invoice, paymentDate, amount, method (cash, bank_transfer, upi) |

Invoice status is one of: `unpaid`, `partly_paid`, `paid`.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/customers | Create a customer |
| GET | /api/customers | List customers |
| POST | /api/invoices | Create an invoice with its items |
| GET | /api/invoices | List invoices with total, amount paid, balance due and status. Filter with `?status=unpaid` |
| GET | /api/invoices/:id | One invoice with its items and payments |
| POST | /api/payments | Record a payment against an invoice |

### Example: create invoice

```json
{
  "invoiceNumber": "INV-001",
  "customer": "CUSTOMER_ID",
  "dueDate": "2026-12-04",
  "items": [
    { "description": "Item A", "quantity": 1, "unitPrice": 5000, "taxRate": 18 },
    { "description": "Item B", "quantity": 1, "unitPrice": 5000, "taxRate": 18 }
  ]
}
```

Response total is `11800`.

### Example: record payment

```json
{
  "invoice": "INVOICE_ID",
  "amount": 5000,
  "method": "upi",
  "paymentDate": "2026-11-04"
}
```

## Business rules

- The server calculates every line total (`quantity x unitPrice + tax`) and the invoice total. Totals sent by the browser are ignored.
- A payment must be greater than zero.
- A payment cannot be more than the remaining balance. It is rejected with a clear message showing the balance due.
- After a payment, the status becomes `partly_paid` if money is still owed, or `paid` if fully settled.
- Saving the payment and updating the invoice status happen in one MongoDB transaction, so both succeed or both fail.
- Required fields are validated, with suitable status codes: 400 (bad input), 404 (not found), 409 (duplicate invoice number), 500 (server error).
- Amount paid and balance due are not stored. They are calculated from the payments every time, so they cannot go out of sync.

## Assumptions

- Used **MongoDB Atlas** instead of MySQL/PostgreSQL. Tables are collections, and invoice items are a separate collection linked to the invoice by its id.
- The invoice number is entered by the user and must be unique.
- Tax is calculated per line: `lineTotal = quantity x unitPrice x (1 + taxRate / 100)`, rounded to 2 decimals.
- The spec example says a payment of 15,000 leaves 6,800 due on an 11,800 invoice. I treated this as a typo for 5,000, then a further 7,000 is rejected.
- Transactions need a replica set, which MongoDB Atlas provides by default.

## What I would improve with more time

- Outstanding report: each customer with the total they still owe, largest first.
- Search and pagination on the invoice list.
- Automated tests for the total calculation and the payment rules.
- A seed script for sample customers.
- Move to TypeScript and add stronger input validation.
- Deploy the backend (Render or Railway) with the Atlas database.
