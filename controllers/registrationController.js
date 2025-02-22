const axios = require("axios");
const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../utils/authenticate");


const saveUserProfession = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

        const { profession } = req.body;
        const user = await UserModel.findOneAndUpdate(
            { email },
            { $set: { profession: profession } },
            { new: true }
        );
        // console.log(user)
        return res.status(200).json({
            message: "Profession Updated Successfully",

        });

    } catch (error) {
        console.log("Error in saving user profession: ", error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const saveUserDetails = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

        const userDetails = req.body;
        const user = await UserModel.findOneAndUpdate(
            { email },
            { $set: { ...userDetails } },
            { new: true }
        );

        // console.log(user, email)

        return res.status(200).json({
            message: "User Details Updated Successfully",

        });

    } catch (error) {
        console.log("Error in saving data: ", error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    saveUserProfession,
    saveUserDetails
};
