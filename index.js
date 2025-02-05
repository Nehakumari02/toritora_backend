const express = require('express')
require('dotenv').config()

const authRouter = require('./routes/authRouter')

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8080
require('./models/dbConnection')

const cors = require('cors')

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.options('*', cors()); 

app.get('/',(req,res)=>{
    res.send("Hello from auth server")
})

app.use('/auth',authRouter)


app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT}`)
})