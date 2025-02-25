const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ["available", "pending", "booked"], 
        default: "available" 
    }
}, { timestamps: true });

const Slot = mongoose.model("Slot", slotSchema);
module.exports = Slot;
