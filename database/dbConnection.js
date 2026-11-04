const mongoose=require('mongoose');

const dbConnection=process.env.DB_CONNECTION;

mongoose.connect(dbConnection).then(()=>{
    console.log('Database connected successfully')
}).catch((err)=>{
    console.error('Error connecting to database:', err)
})