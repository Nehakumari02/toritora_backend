const mongoose = require('mongoose')

const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL, {
    maxPoolSize: 100,
    minPoolSize: 10,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
  }).then(
    ()=>{
        console.log("MongoDB is connected")
    }
).catch(
    (error)=>{console.log("Error in connecting to MongoDB: ",error)}
)