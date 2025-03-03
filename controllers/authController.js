const axios = require("axios")
const { oauth2client } = require("../utils/googleConfig")
const UserModel = require("../models/userModel")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const VerificationModel = require("../models/verificationCodeModel");
const { sendWelcomeEmail } = require("../utils/sendMail");
const { authenticateUser } = require("../utils/authenticate");

const generateUniqueUserId = async (email) => {
    const namePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").substring(0, 6);
    
    let userId;
    let isUnique = false;

    while (!isUnique) {
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        userId = `${namePart}${randomPart}`;

        const existingUser = await UserModel.findOne({ userId });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return userId;
};

const generateUniqueUserName = async (email) => {
    const namePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);

    let username;
    let isUnique = false;

    while (!isUnique) {
        const randomNumber = Math.floor(100 + Math.random() * 900);
        username = `${namePart}${randomNumber}`;

        const existingUser = await UserModel.findOne({ username });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return username;
};

const googleLogin = async (req, res) => {
    try {
        const { code } = req.query
        const { rememberMe = false } = req.body
        console.log("code:", code)
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

        const { email, name, picture } = userRes.data

        let user = await UserModel.findOne({ email })
        // console.log("user:", user)
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

        // Set token expiry based on rememberMe flag
        const tokenExpiry = rememberMe ? "30d" : process.env.JWT_TIMEOUT; // 30 days if rememberMe is true, else default
        const cookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            {
                expiresIn: tokenExpiry
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
            maxAge: cookieExpiry,
            path: '/',
        });

        if(!user.isProfileCompleted){
            return res.status(202).json({
                message: "Login successful, profile incomplete"
            })
        }

        return res.status(200).json({
            message: "Success",
            user:{profession:user?.profession}
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
            const userId = await generateUniqueUserId(email);
            const username = await generateUniqueUserName(email);

            user = await UserModel.create({
                name, email, profilePicture: picture, isGoogleLogin: true, userId, username
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

                return res.status(201).json({
                    message: "User already exist",
                    user:{profession:user?.profession}
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
        const { email, password, rememberMe = false } = req.body
        // console.log(email, password)

        let user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(203).json({
                message: "User not found"
            })
        }

        // console.log(user)
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

        // Set token expiry based on rememberMe flag
        const tokenExpiry = rememberMe ? "30d" : process.env.JWT_TIMEOUT; // 30 days if rememberMe is true, else default
        const cookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            {
                expiresIn: tokenExpiry
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
            maxAge: cookieExpiry,
            path: '/',
        });

        if(!user.isProfileCompleted){
            return res.status(202).json({
                message: "Login successful, profile incomplete"
            })
        }

        return res.status(200).json({
            message: "Login successful",
            user:{profession:user?.profession}
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

        // console.log(email, password, otp)

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

        // console.log(email, password)
        console.log("Code verification successful")
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await generateUniqueUserId(email);
        const username = await generateUniqueUserName(email);

        user = await UserModel.create({
            email,
            password: hashedPassword,
            isGoogleLogin: false,
            userId,
            username
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
        console.error("Logout Error:", error);
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