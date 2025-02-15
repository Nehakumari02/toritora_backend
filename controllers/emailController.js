const axios = require("axios");
const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const VerificationModel = require("../models/verificationCodeModel");
const { sendMail } = require("../utils/sendMail");

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)

        let user = await UserModel.findOne({ email });

        console.log("user:", user);

        if (user) {
            console.log("user already exist");
            return res.status(204).json({
                message: "User already exist"
            });
        }

        const verificationCode = generateVerificationCode();

        const htmlBody = `
            <html>
                <head>
                    <style>
                        /* Primary brand color */
                        :root {
                            --primary-color: hsl(35, 100%, 55%);
                        }

                        .verification-code {
                            font-size: 24px;
                            display: flex;
                            justify-content: space-between;
                            width: 240px;
                            margin-top: 20px;
                        }

                        .verification-box {
                            width: 35px;
                            height: 35px;
                            border: 2px solid var(--primary-color);
                            text-align: center;
                            font-size: 20px;
                            font-weight: bold;
                            margin-right: 5px;
                            border-radius: 5px;
                            color: var(--primary-color);
                        }

                        .welcome-message {
                            font-family: Arial, sans-serif;
                            font-size: 18px;
                            color: #333;
                            line-height: 1.6;
                        }

                        .welcome-message p {
                            color: #555;
                        }

                        h2 {
                            color: var(--primary-color);
                            font-size: 22px;
                            margin-bottom: 10px;
                        }

                        .footer {
                            font-size: 14px;
                            color: #888;
                        }

                        .cta-button {
                            display: inline-block;
                            background-color: var(--primary-color);
                            color: white;
                            padding: 12px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin-top: 20px;
                        }

                        .cta-button {
                            background-color: hsl(35, 100%, 45%);
                        }
                    </style>
                </head>
                <body>
                    <div class="welcome-message">
                        <p>Dear User,</p>
                        <p>Welcome to Toritora! We're excited to have you onboard. To complete your registration, please use the following verification code:</p>
                    </div>
                    <div class="verification-code">
                        <div class="verification-box">${verificationCode[0]}</div>
                        <div class="verification-box">${verificationCode[1]}</div>
                        <div class="verification-box">${verificationCode[2]}</div>
                        <div class="verification-box">${verificationCode[3]}</div>
                        <div class="verification-box">${verificationCode[4]}</div>
                        <div class="verification-box">${verificationCode[5]}</div>
                    </div>
                    <p>If you did not request this verification, please ignore this email.</p>
                    <p class="footer">Best regards,<br>Toritora Team</p>
                    <a href="#" class="cta-button">Toritora</a>
                </body>
            </html>
        `;

        await sendMail(email, "Your Verification Code", htmlBody);

        const existingVerification = await VerificationModel.findOne({ email });
        if (existingVerification) {
            existingVerification.verificationCode = verificationCode;
            existingVerification.createdAt = Date.now();
            await existingVerification.save();
        } else {
            const verification = new VerificationModel({
                email: email,
                verificationCode: verificationCode
            });
            await verification.save();
        }

        return res.status(200).json({
            message: "Verification code sent successfully",
            email
        });

    } catch (error) {
        console.log("Error in sendVerificationCode: ", error);
        res.status(500).json({
            message: "Internal server error",
            error
        });
    }
};

module.exports = {
    sendVerificationCode
};
