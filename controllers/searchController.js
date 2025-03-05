const UserModel = require("../models/userModel");
const Slot = require("../models/slotModel");
const { authenticateUser } = require("../utils/authenticate");

const searchWithFilter = async (req, res) => {
    try {
        // const { _id, email } = await authenticateUser(req, res);
        const { name, location, isWeek, date, genres, experience, type, pageNo = 1, pageSize = 10 } = req.query;
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

        if (location) {
            filter.location = { $in: Array.isArray(location) ? location : [location] };
        }

        if (genres && genres !== "All") {
            filter.genres = { $in: Array.isArray(genres) ? genres : [genres] };
        }

        if (type === "modelling") {
            filter.profession = "photographer";
        } else if (type === "photographer") {
            filter.profession = "modelling";
        }

        // if (date) {
        //     const availableUserIds = await Slot.distinct("user_id", { 
        //         date, 
        //         status: "available" // Ensure slot is available
        //     });
        
        //     if (availableUserIds.length > 0) {
        //         filter._id = { $in: availableUserIds };
        //     }
        
        //     console.log("Available Users on", date, ":", availableUserIds);
        // }

        if (date || isWeek) {
            let dateFilter = {};
            
            if (date) {
                dateFilter.date = date;
            } else if (isWeek === "true") {
                const today = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(today.getDate() + 7);

                dateFilter.date = { $gte: today.toISOString().split("T")[0], $lte: nextWeek.toISOString().split("T")[0] };
            }

            const availableUserIds = await Slot.distinct("user_id", { 
                ...dateFilter,
                status: "available"
            });

            filter._id = { $in: availableUserIds };

            console.log("Available Users:", availableUserIds);
        }

        console.log(filter)
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
console.log(users)
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
