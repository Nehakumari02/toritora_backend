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
        const { email, locale, lastName, firstName } = req.body;

        let user = await UserModel.findOne({ email });

        // console.log("user:", user);

        if (user) {
            console.log("user already exist");
            return res.status(204).json({
                message: "User already exist"
            });
        }

        const verificationCode = generateVerificationCode();

        //  if want name of user then use this code              <p>${locale==="jn"?`${lastName} ${firstName} 様,`:`Dear ${lastName} ${firstName},`}</p>

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
                        <p>${locale==="jn"?`親愛なるユーザー様,`:`Dear user,`}</p>
                        <p>${locale==="jn"?"このたびは、Toritoraにご登録いただき誠にありがとうございます。ご登録手続きを完了するために、以下の認証コードをご入力ください。":"Welcome to Toritora! We're excited to have you onboard. To complete your registration, please use the following verification code:"}</p>
                    </div>
                    <div class="verification-code">
                        <div class="verification-box">${verificationCode[0]}</div>
                        <div class="verification-box">${verificationCode[1]}</div>
                        <div class="verification-box">${verificationCode[2]}</div>
                        <div class="verification-box">${verificationCode[3]}</div>
                        <div class="verification-box">${verificationCode[4]}</div>
                        <div class="verification-box">${verificationCode[5]}</div>
                    </div>
                    <p>${locale==="jn"?"※このメールにお心当たりのない場合は、破棄していただきますようお願いいたします。":"If you did not request this verification, please ignore this email."}</p>
                    <p class="footer">${locale==="jn"?"今後ともToritoraをよろしくお願い申し上げます。<br/>―――――――――――――<br/>Toritora運営事務局":"Best regards,<br>Toritora Team"}</p>
                    <a href="mailto:info@toritora.co.jp" class="cta-button">Toritora</a>
                </body>
            </html>
        `;

        await sendMail(email, locale==="jn"?"あなたの認証コード":"Your Verification Code", htmlBody);

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

const sendResetPasswordCode = async (req, res) => {
    try {
        const { email, locale } = req.body;

        let user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(203).json({
                message: "No user found with this email"
            });
        }

        if(user.isGoogleLogin){
            return res.status(203).json({
                message: "Please login with google"
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
                        
                        .hidden {
                            display: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="welcome-message">
                        <p class="hidden">Dear User,</p>
                        <p>${locale==="jn"?`${user.lastName} ${user.firstName} 様,`:`Dear ${user.lastName} ${user.firstName},`}</p>
                        <p>${locale==="jn"?"パスワードのリセットを完了するには、以下のコードをご利用ください。":"To complete password reset, please use the following code:"}</p>
                    </div>
                    <div class="verification-code">
                        <div class="verification-box">${verificationCode[0]}</div>
                        <div class="verification-box">${verificationCode[1]}</div>
                        <div class="verification-box">${verificationCode[2]}</div>
                        <div class="verification-box">${verificationCode[3]}</div>
                        <div class="verification-box">${verificationCode[4]}</div>
                        <div class="verification-box">${verificationCode[5]}</div>
                    </div>
                    <p>${locale === "jn" ? "このコードにお心当たりがない場合は、このメールを無視してください。" : "If you did not request this code, please ignore this email."}</p>
                    <p class="footer">${locale === "jn" ? "今後ともToritoraをよろしくお願い申し上げます。<br>―――――――――――――<br>Toritora運営事務局" : "Best regards,<br>Toritora Team"}</p>
                    <a href="https://meduon.jp" class="cta-button">Toritora</a>
                </body>
            </html>
        `;

        await sendMail(email, locale==="jn"?`パスワード再設定コード - ${verificationCode}`:`Your Password Reset Code - ${verificationCode}`, htmlBody);

        await UserModel.updateOne(
            { email },
            {
                $set: {
                    forgetPasswordToken: verificationCode.toString(),
                    forgetPasswordTokenExpiry: Date.now() + 2 * 60 * 1000
                }
            }
        );

        return res.status(200).json({
            message: "Password reset code sent successfully",
        });

    } catch (error) {
        console.log("Error in sendPasswordResetCode: ", error);
        res.status(500).json({
            message: "Internal server error",
            error
        });
    }
};

module.exports = {
    sendVerificationCode,
    sendResetPasswordCode
};
