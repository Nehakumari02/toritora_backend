const UserModel = require("../models/userModel");
const SlotModel = require("../models/slotModel");
const { authenticateUser } = require("../utils/authenticate");

const searchWithFilter = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req, res);
        const { name, location, date, genres, experience, type, pageNo = 1, pageSize = 10 } = req.body;
        console.log(name,location,date,genres,experience,type)

        const limit = parseInt(pageSize);
        const skip = (parseInt(pageNo) - 1) * limit;

        const filter = { isProfileCompleted: true };

        if (name) {
            filter.$or = [
                { firstName: { $regex: name, $options: "i" } },
                { lastName: { $regex: name, $options: "i" } }
            ];
        }

        if (location && Array.isArray(location) && location.length > 0) {
            filter.location = { $in: location };
        }

        if (genres) {
            filter.genres = { $in: genres };
        }

        if (experience) {
            filter.experience = experience;
        }

        if (type === "modelling") {
            filter.profession = "photographer";
        } else if (type === "photographer") {
            filter.profession = "modelling";
        }

        if (date) {
            const availableUserIds = await SlotModel.distinct("userId", { date });
            filter.userId = { $in: availableUserIds };
        }

        const users = await UserModel.find(filter, {
            firstName: 1,
            lastName: 1,
            address: 1,
            profilePicture: 1,
            userId: 1,
            experience: 1,
            genres: 1,
            createdAt: 1,
            _id: 0
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await UserModel.countDocuments(filter);

        return res.status(200).json({
            message: "Filtered models fetched successfully",
            users,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNo,
            totalCount
        });
    } catch (error) {
        console.error("Error in filtering models:", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = { searchWithFilter };
