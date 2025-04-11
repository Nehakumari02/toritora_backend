const Toritai = require("../models/toritaiModel");
const UserModel = require("../models/userModel");
const { authenticateUser } = require("../utils/authenticate");

const fetchModels = async (req, res) => {
    try {
        const { pageNo = "1", pageSize = "10", isNew = false, type = "modelling" } = req.query;
        let isNewBool;
        if(isNew === 'true'){
            isNewBool = true;
        }
        else{
            isNewBool === false;
        }

        const limit = parseInt(pageSize);
        const skip = (parseInt(pageNo) - 1) * limit;

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const filter = { isProfileCompleted: true };
        if (isNewBool) {
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
                location: 1,
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
            totalCount,
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
                _id: 1,
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
                location: 1,
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

        const isToritaiSent = await Toritai.exists({ user_id: _id, user_id_2: user._id });

        return res.status(200).json({
            message: "User details fetched successfully",
            user,
            isToritaiSent: !!isToritaiSent
        });

    } catch (error) {
        console.error("Error in fetching user:", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    fetchModels,
    fetchUserInfo
};
