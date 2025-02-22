const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

async function authenticateUser(req, res) {
  try {
    const token = req.cookies.toritoraAuth;
    if (!token) {
      const error = new Error("Authorization error: No token provided");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, email } = decoded;

    const user = await UserModel.findOne({ _id, email }, "authToken");

    if (!user || user.authToken !== token) {
      const error = new Error("Unauthorized: Invalid token or user not found");
      error.statusCode = 401;
      throw error;
    }

    return { _id, email };
  } catch (error) {
    console.error("Authentication error:", error.message);
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

module.exports = {
  authenticateUser,
};
