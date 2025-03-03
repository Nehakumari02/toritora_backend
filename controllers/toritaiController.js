const Toritai = require("../models/toritaiModel");
const { authenticateUser } = require("../utils/authenticate");

const fetchToritai = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const { pageNo = "1", pageSize = "50" } = req.query;

        const targetUserId = _id;

        const page = parseInt(pageNo, 10);
        const limit = parseInt(pageSize, 10);
        const skip = (page - 1) * limit;

        const toritaiRecords = await Toritai.find({
            $or: [{ user_id: targetUserId }, { user_id_2: targetUserId }]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user_id",
                select: "firstName lastName profilePicture"
            })
            .populate({
                path: "user_id_2",
                select: "firstName lastName profilePicture"
            });
        

        const totalToritai = await Toritai.countDocuments({
            $or: [{ user_id: targetUserId }, { user_id_2: targetUserId }]
        });

        const sentToritai = toritaiRecords.filter(record => record.user_id._id.toString() === targetUserId.toString());
        const receivedToritai = toritaiRecords.filter(record => record.user_id_2._id.toString() === targetUserId.toString());

        return res.status(200).json({
            message: "Toritai records fetched successfully",
            sentToritai,
            receivedToritai,
            pagination: {
                page,
                pageSize: limit,
                totalToritai
            }
        });

    } catch (error) {
        console.error("Error fetching Toritai records:", error);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const addToritai = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const { user_id_2, question1, question2 = "" } = req.body;

        if (!user_id_2 || !question1) {
            return res.status(400).json({ message: "Fields user_id_2 and question1 are required" });
        }

        const existingToritai = await Toritai.findOne({
            $or: [
                { user_id: _id, user_id_2 },
                { user_id: user_id_2, user_id: _id }
            ]
        });

        if (existingToritai) {
            return res.status(400).json({ message: "Toritai record already exists between these users" });
        }


        const newToritai = new Toritai({
            user_id: _id,
            user_id_2,
            question1,
            ...(question2 && { question2 })
        });

        await newToritai.save();

        return res.status(201).json({
            message: "Toritai record added successfully",
            toritai: newToritai
        });

    } catch (error) {
        console.error("Error adding Toritai record:", error);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = { fetchToritai, addToritai };