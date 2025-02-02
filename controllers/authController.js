const axios = require("axios")
const { oauth2client } = require("../utils/googleConfig")
const UserModel = require("../models/userModel")
const jwt = require("jsonwebtoken")

const googleLogin = async (req,res)=>{
    try {
        const {code} = req.query
        console.log("code:",code)
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

        const {email,name,picture} = userRes.data

        let user = await UserModel.findOne({email})
        console.log("user:",user)
        if(!user){
            console.log("user does not exist")
            return res.status(204).json({
                message: "User does not exist"
            })
        }
        const {_id} = user
        const token = jwt.sign(
            {_id,email},
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_TIMEOUT
            }
        )

        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Success",
            user
        })
    } catch (error) {
        console.log("Signin with google error: ",error)
        res.status(500).json({
            message:"Internal server error",
            error
        })
    }
}

const googleSignup = async (req,res)=>{
    try {
        const {code} = req.query
        console.log("code:",code)
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

        const {email,name,picture} = userRes.data

        let user = await UserModel.findOne({email})
        let existingUser = true;
        if(!user){
            user = await UserModel.create({
                name,email,image:picture
            })
            existingUser = false;
        }
        const {_id} = user
        const token = jwt.sign(
            {_id,email},
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_TIMEOUT
            }
        )

        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        if(existingUser){
            return res.status(204).json({
                message: "User already exist",
                user
            })
        }
        else {
            return res.status(200).json({
                message: "Successfully registered new user",
                user
            })
        }
    } catch (error) {
        console.log("Signup with google error: ",error)
        res.status(500).json({
            message:"Internal server error",
            error
        })
    }
}

const Signin = async (req,res)=>{
    try {
        const {code} = req.query

        let user = await UserModel.findOne({email})
        if(!user){
            user = await UserModel.create({
                name,email,image:picture
            })
        }
        const {_id} = user
        const token = jwt.sign(
            {_id,email},
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_TIMEOUT
            }
        )

        // ✅ Set token as a cookie
        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Success",
            user
        })
    } catch (error) {
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

const Signup = async (req,res)=>{
    try {
        const {code} = req.query
        console.log("code:",code)
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
        console.log(userRes)

        const {email,name,picture} = userRes.data

        let user = await UserModel.findOne({email})
        if(!user){
            user = await UserModel.create({
                name,email,image:picture
            })
        }
        const {_id} = user
        const token = jwt.sign(
            {_id,email},
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_TIMEOUT
            }
        )

        // ✅ Set token as a cookie
        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Success",
            user
        })
    } catch (error) {
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

module.exports = {
    googleLogin,
    googleSignup,
    Signin,
    Signup
}