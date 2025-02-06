const express = require('express')
require('dotenv').config()

const authRouter = require('./routes/authRouter')

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8080
require('./models/dbConnection')

const cors = require('cors')

// CORS Configuration
const corsOptions = {
    origin: process.env.ORIGIN,  // Ensure this matches your frontend URL
    credentials: true,           // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); 

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.get('/',(req,res)=>{
    res.send("Hello from auth server")
})

app.use('/auth',authRouter)


app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT}`)
})