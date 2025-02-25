const FavouriteList = require("../models/favouriteListModel");
const { authenticateUser } = require("../utils/authenticate");

const fetchFavourite = async (req, res) => {
    try {
        const { _id: user_id } = await authenticateUser(req, res);

        const favourites = await FavouriteList.find({ user_id })
            .populate("f_user_id", "firstName lastName profilePicture")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Favourite users fetched successfully",
            favourites
        });

    } catch (error) {
        console.error("Error in fetching favourites:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const updateFavourite = async (req, res) => {
    try {
        const { _id: user_id } = await authenticateUser(req, res);
        const { f_user_id } = req.body;

        if (!f_user_id) {
            return res.status(400).json({ message: "f_user_id is required" });
        }

        const existingFavourite = await FavouriteList.findOne({ user_id, f_user_id });

        if (existingFavourite) {
            return res.status(400).json({ message: "User is already in favourites" });
        }

        const newFavourite = await FavouriteList.create({ user_id, f_user_id });

        return res.status(201).json({
            message: "User added to favourites successfully",
            favourite: newFavourite
        });

    } catch (error) {
        console.error("Error in adding favourite:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const deleteFavourite = async (req, res) => {
    try {
        const { _id: user_id } = await authenticateUser(req, res);
        const { f_user_id } = req.body;

        if (!f_user_id) {
            return res.status(400).json({ message: "f_user_id is required" });
        }

        const deletedFavourite = await FavouriteList.findOneAndDelete({ user_id, f_user_id });

        if (!deletedFavourite) {
            return res.status(404).json({ message: "User not found in favourites" });
        }

        return res.status(200).json({ message: "User removed from favourites successfully" });

    } catch (error) {
        console.error("Error in removing favourite:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    fetchFavourite,
    updateFavourite,
    deleteFavourite
};
