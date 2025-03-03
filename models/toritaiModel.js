const mongoose = require("mongoose");

const toritaiSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question1: { type: String, required: true },
    question2: { type: String }
}, { timestamps: true });

const Toritai = mongoose.model("Toritai", toritaiSchema);
module.exports = Toritai;
