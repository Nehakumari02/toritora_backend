const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  payment_mode: { type: String },
  payment_id: { type: String},
  payment_status: { type: String, required: true, default: 'pending', enum: ["pending", "paid", "failed"] },

  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  location: { type: String, default: '' },
  fees: { type: Number, default: 0 },
  transportation_fees: { type: Number, default: 0 },

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

  reservation_status: { type: String, default: "pending", enum: ["pending", "completed", "running"]},

  // Edited fields (optional, won't be created until a value is assigned)
  editedShootingPlace: { type: String },
  editedShootingLocation: { type: String },
  editedMeetingPoint: { type: String },
  editedShootingConcept: { type: String },
  editedClothingType: { type: String },
  editedShoesType: { type: String },
  editedItemsType: { type: String },
  editedMakeUpType: { type: String },

  editedShootingPlaceRainy: { type: String },
  editedShootingLocationRainy: { type: String },
  editedMeetingPointRainy: { type: String },
  editedShootingConceptRainy: { type: String },
  editedClothingTypeRainy: { type: String },
  editedShoesTypeRainy: { type: String },
  editedItemsTypeRainy: { type: String },
  editedMakeUpTypeRainy: { type: String },

  editRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'accepted', 'rejected'],
    default: 'none',
  },

}, { timestamps: true });

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
