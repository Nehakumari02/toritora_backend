const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "pending"},
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
