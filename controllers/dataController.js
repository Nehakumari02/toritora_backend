const UserModel = require("../models/userModel");
const { authenticateUser } = require("../utils/authenticate");

const fetchModels = async (req, res) => {
    try {

        const { pageNo = "1", pageSize = "10", isNew = false, type = "modelling" } = req.query;

        const limit = parseInt(pageSize);
        const skip = (parseInt(pageNo) - 1) * limit;

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const filter = {};
        if (isNew) {
            filter.createdAt = { $gte: oneMonthAgo };
        }

        if (type === "modelling") {
            filter.profession = "photographer";
        } else if (type === "photographer") {
            filter.profession = "modelling";
        }

        const models = await UserModel.find(filter, { 
                firstName: 1,
                lastName: 1,
                address: 1,
                profilePicture: 1,
                userId: 1,
                createdAt: 1,
                _id: 0
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await UserModel.countDocuments(filter);

        return res.status(200).json({
            message: "Models fetched successfully",
            models,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNo,
        });
    } catch (error) {
        console.error("Error in fetching models:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const fetchUserInfo = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

        const { userId = "" } = req.query;

        const user = await UserModel.findOne(
            { userId },

            { 
                _id: 0,
                firstName: 1,
                lastName: 1,
                address: 1,
                profilePicture: 1,
                userId: 1,
                createdAt: 1,
                achievements: 1,
                cameraType: 1,
                genres: 1,
                images: 1,
                instagram: 1,
                modellingExperiance: 1,
                photographyExperience: 1,
                profession: 1,
                selfIntroduction: 1,
                shootingPrice: 1,
                snsUsername: 1,
                transportationFee: 1,
                twitter: 1,
                username: 1,
                website: 1
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user
        });

    } catch (error) {
        console.error("Error in fetching user:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    fetchModels,
    fetchUserInfo
};
