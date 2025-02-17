const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

async function authenticateUser(req, res) {
  try {
    const token = req.cookies.toritoraAuth;
    if (!token) {
      throw new Error("Authorization error: No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, email } = decoded;


    const user = await UserModel.findOne({ _id, email }, 'authToken');

    if (!user || user.authToken !== token) {
      throw new Error("Unauthorized: Invalid token or user not found");
    }
    return email;
    
  } catch (error) {
    console.error("Authentication error:", error.message);
    throw new Error(error.message);
  }
}

module.exports = {
    authenticateUser
}