const mongoose = require('mongoose')

const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL).then(
    ()=>{
        console.log("MongoDB is connected")
    }
).catch(
    (error)=>{console.log("Error in connecting to MongoDB: ",error)}
)