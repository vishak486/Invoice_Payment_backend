require('dotenv').config();
const express= require('express')
const cors=require('cors')
require('./database/dbConnection')
const router = require('./routes/router')

const InvoiceServer=express()

InvoiceServer.use(cors())
InvoiceServer.use(express.json())
InvoiceServer.use(router)

const PORT=process.env.PORT || 3000

InvoiceServer.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})

InvoiceServer.get('/',(req,res)=>{
    res.send('Invoice Payment Backend is running')
})