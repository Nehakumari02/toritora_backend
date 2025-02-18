const axios = require("axios")
const { oauth2client } = require("../utils/googleConfig")
const UserModel = require("../models/userModel")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const VerificationModel = require("../models/verificationCodeModel");
const { sendWelcomeEmail } = require("../utils/sendMail");
const { authenticateUser } = require("../utils/authenticate");

const googleLogin = async (req, res) => {
    try {
        const { code } = req.query
        console.log("code:", code)
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

        const { email, name, picture } = userRes.data

        let user = await UserModel.findOne({ email })
        console.log("user:", user)
        if (!user) {
            console.log("user does not exist")
            return res.status(204).json({
                message: "User does not exist"
            })
        }

        if (!user.isGoogleLogin) {
            return res.status(203).json({
                message: "Login with credentials"
            })
        }

        const { _id } = user
        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT
            }
        )

        await UserModel.findOneAndUpdate(
            { _id },
            { authToken: token }
        );

        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        if(!user.isProfileCompleted){
            return res.status(202).json({
                message: "Login successful, profile incomplete"
            })
        }

        return res.status(200).json({
            message: "Success",
            user
        })
    } catch (error) {
        console.log("Signin with google error: ", error)
        res.status(500).json({
            message: "Internal server error",
            error
        })
    }
}

const googleSignup = async (req, res) => {
    try {
        const { code } = req.query
        console.log("code:", code)
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

        const { email, name, picture } = userRes.data

        let user = await UserModel.findOne({ email })
        let existingUser = true;
        if (!user) {
            user = await UserModel.create({
                name, email, profilePicture: picture, isGoogleLogin: true
            })
            existingUser = false;
        }
        const { _id } = user
        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT
            }
        )

        await UserModel.findOneAndUpdate(
            { _id },
            { authToken: token }
        );

        if (existingUser) {
            if (user.isGoogleLogin) {
                res.cookie("toritoraAuth", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/',
                });

                if(!user.isProfileCompleted){
                    return res.status(202).json({
                        message: "Signup successful, profile incomplete"
                    })
                }

                return res.status(204).json({
                    message: "User already exist",
                    user
                })
            }
            else {

                return res.status(205).json({
                    message: "Login with credentials instead"
                })
            }
        }
        else {
            res.cookie("toritoraAuth", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });
            return res.status(200).json({
                message: "Successfully registered new user",
                user
            })
        }
    } catch (error) {
        console.log("Signup with google error: ", error)
        res.status(500).json({
            message: "Internal server error",
            error
        })
    }
}

const Signin = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email, password)

        let user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(203).json({
                message: "User not found"
            })
        }

        console.log(user)
        if (user.isGoogleLogin) {
            return res.status(202).json({
                message: "Kindly login using google"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const { _id } = user
        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT
            }
        )

        await UserModel.findOneAndUpdate(
            { _id },
            { authToken: token }
        );

        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        if(!user.isProfileCompleted){
            return res.status(202).json({
                message: "Login successful, profile incomplete"
            })
        }

        return res.status(200).json({
            message: "Login successful",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

const Signup = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        console.log(email, password, otp)

        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const verification = await VerificationModel.findOne({ email });
        if (!verification) {
            return res.status(400).json({
                message: "Verification code has not been sent or has expired"
            });
        }

        if (verification.verificationCode !== otp) {
            return res.status(400).json({
                message: "OTP does not match"
            });
        }

        console.log(email, password)
        console.log("Code verification successful")
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await UserModel.create({
            email,
            password: hashedPassword,
            isGoogleLogin: false
        });

        const { _id } = user;
        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT
            }
        );

        await UserModel.findOneAndUpdate(
            { _id },
            { authToken: token }
        );

        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        sendWelcomeEmail(email);

        return res.status(200).json({
            message: "Signup successful",
            user
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const Logout = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

        const token = jwt.sign(
            { },
            process.env.JWT_SECRET,
            {
                expiresIn: 0
            }
        );

        await UserModel.findOneAndUpdate(
            { email },
            { authToken: token }
        );

        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 0,
            path: '/',
        });

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Signup Error:", error);
        const token = jwt.sign(
            { },
            process.env.JWT_SECRET,
            {
                expiresIn: 0
            }
        );
        
        res.cookie("toritoraAuth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 0,
            path: '/',
        });
        res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    googleLogin,
    googleSignup,
    Signin,
    Signup,
    Logout
}