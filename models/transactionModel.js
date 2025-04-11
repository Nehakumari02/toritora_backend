const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    payment_id: { type: String},
    payment_status: { type: String, required: true, default: 'pending', enum: ["success", "failed"] },
    amount: {type: Number},
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
