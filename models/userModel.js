const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    isGoogleLogin: {
        type: Boolean
    },
    isProfileCompleted: {
        type: Boolean,
        default: false
    },

    authToken: {
        type: String
    },
    forgetPasswordToken: {
        type: String
    },
    forgetPasswordTokenExpiry: {
        type: Date
    },



    profession: {
        type: String
    },
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: String },
    age: { type: String },
    gender: { type: String },
    mobile: { type: String },
    postalCode: { type: String },
    address: { type: String },
    profilePicture: { type: String, default: null },
    userId: { type: String },
    username: { type: String },
    genres: { type: String },
    achievements: { type: [String], default: [] },

    cameraType: { type: String },
    shootingPrice: { type: String },
    transportationFee: { type: String },
    snsUsername: { type: String },
    website: { type: String },
    selfIntroduction: { type: String },
    photographyExperience: { type: String }, // New field for experience
    importantThing: { type: String },
    stress: { type: String },
    assistanceWithModels: { type: String },
    hobbies: { type: String },
    idProof: { type: String },
    height: { type: String },
    modellingExperiance: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    images: { type: [String], default: [] } // Array of URLs
},
{ timestamps: true }
)

const UserModel = mongoose.model('User', UserSchema)
module.exports = UserModel