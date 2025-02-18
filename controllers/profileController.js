const axios = require("axios");
const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../utils/authenticate");

const fetchUser = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

        const user = await UserModel.findOne(
            { email },
            { _id: 0, password: 0 }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

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

const updateUser = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

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
    fetchUser,
    updateUser
};
