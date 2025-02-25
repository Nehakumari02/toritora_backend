const mongoose = require("mongoose");

const FavouriteListSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    f_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FavouriteList = mongoose.model("FavouriteList", FavouriteListSchema);
module.exports = FavouriteList;
