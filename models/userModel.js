const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name:{
        type: String
    },
    email:{
        type: String
    },
    image:{
        type: String
    },
    password:{
        type: String
    },
    isGoogleLogin:{
        type: Boolean
    }
})

const UserModel = mongoose.model('User',UserSchema)
module.exports = UserModel