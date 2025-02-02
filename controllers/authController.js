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
    googleLogin
}