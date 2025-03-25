const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "pending"},
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  // Optional fields for the regular and rainy day forms
  shootingPlace: { type: String },
  shootingLocation: { type: String },
  meetingPoint: { type: String },
  shootingConcept: { type: String },
  clothingType: { type: String },
  shoesType: { type: String },
  itemsType: { type: String },
  makeUpType: { type: String },

  shootingPlaceRainy: { type: String },
  shootingLocationRainy: { type: String },
  meetingPointRainy: { type: String },
  shootingConceptRainy: { type: String },
  clothingTypeRainy: { type: String },
  shoesTypeRainy: { type: String },
  itemsTypeRainy: { type: String },
  makeUpTypeRainy: { type: String },
}, { timestamps: true });

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
