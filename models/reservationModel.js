const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  payment_mode: { type: String },
  payment_id: { type: String},
  payment_status: { type: String, required: true, default: 'pending', enum: ["pending", "completed", "failed"] },

  event_date: { type: Date, required: true },
  event_start_time: { type: Date, required: true },
  event_end_time: { type: Date, required: true },

  location: { type: String, default: '' },
  fees: { type: Number, default: 0 },
  transportation_fees: { type: Number, default: 0 },

  reservation_status: { type: String, default: "pending", enum: ["pending", "completed", "running"]}

}, { timestamps: true });

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
