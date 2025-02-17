const axios = require("axios");
const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../utils/authenticate");

const getUploadUrl = async (req, res) => {
    try {
        const email = await authenticateUser(req,res);

        return res.status(200).json({
            message: "User details fetched successfully",
            user
        });

    } catch (error) {
        console.error("Error in fetching user:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const deleteUploadedFile = async (req, res) => {
    try {
        const email = await authenticateUser(req,res);

        const updateData = { ...req.body };

        delete updateData._id;
        delete updateData.email;
        delete updateData.password;

        const updatedUser = await UserModel.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true, projection: { _id: 0, password: 0 } }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User details updated successfully",
            updatedUser
        });

    } catch (error) {
        console.error("Error in updating user:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getUploadUrl,
    deleteUploadedFile
};
