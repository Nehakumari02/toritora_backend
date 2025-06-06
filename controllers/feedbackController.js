const Feedback = require("../models/feedbackModel");
const Toritai = require("../models/toritaiModel");
const { authenticateUser } = require("../utils/authenticate");

const addFeedback = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const { text, rating } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Feedback text is required." });
        }

        const newFeedback = new Feedback({
            user_id: _id,
            text,
            ...(rating !== undefined && { rating })
        });

        await newFeedback.save();

        return res.status(201).json({
            message: "Feedback submitted successfully.",
            feedback: newFeedback
        });

    } catch (error) {
        console.error("Error adding feedback:", error);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = { addFeedback };