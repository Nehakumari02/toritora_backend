const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One earnings record per user
  },
  total_earned: {
    type: Number,
    default: 0, // Total income from services/slots
  },
  total_spent: {
    type: Number,
    default: 0, // Total paid for booking others' slots
  },
  total_withdrawn: {
    type: Number,
    default: 0, // Amount the user has withdrawn to their bank
  },
}, { timestamps: true });

const Earning = mongoose.model("Earning", earningSchema);
module.exports = Earning;
