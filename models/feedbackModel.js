const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
