const Slot = require("../models/slotModel");
const { authenticateUser } = require("../utils/authenticate");

const fetchSlots = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const { month, year, user_id } = req.query;  // Accept `user_id` from query
        console.log(month,year,user_id)

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required" });
        }

        const targetUserId = user_id || _id; // Use provided `user_id`, or fallback to authenticated user

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const slots = await Slot.find({
            user_id: targetUserId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1, startTime: 1 });

        return res.status(200).json({ message: "Slots fetched successfully", slots });

    } catch (error) {
        console.error("Error fetching slots:", error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const addSlots = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const slots = req.body.slots;

        if (!Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ message: "Slots must be an array with at least one slot" });
        }

        const formattedSlots = slots.map(slot => ({
            user_id: _id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: "available"
        }));

        const insertedSlots = await Slot.insertMany(formattedSlots);

        return res.status(201).json({
            message: "Slots added successfully",
            slots: insertedSlots
        });

    } catch (error) {
        console.error("Error adding slots:", error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const { slot_id } = req.body;

        if (!slot_id) {
            return res.status(400).json({ message: "Slot ID is required" });
        }

        const deletedSlot = await Slot.deleteOne({ _id: slot_id, user_id: _id });

        if (deletedSlot.deletedCount === 0) {
            return res.status(404).json({ message: "Slot not found or unauthorized" });
        }

        return res.status(200).json({ message: "Slot deleted successfully" });

    } catch (error) {
        console.error("Error deleting slot:", error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const updateSlot = async (req, res) => {
    try {
        const { _id } = await authenticateUser(req, res);
        const { slot_id, date, startTime, endTime, status } = req.body;

        if (!slot_id) {
            return res.status(400).json({ message: "Slot ID is required" });
        }

        const updateData = {};
        if (date) updateData.date = date;
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (status && ["available", "pending", "booked"].includes(status)) {
            updateData.status = status;
        }

        const updatedSlot = await Slot.findOneAndUpdate(
            { _id: slot_id, user_id: _id },
            { $set: updateData },
            { new: true }
        );
        
        if (!updatedSlot) {
            return res.status(404).json({ message: "Slot not found or unauthorized" });
        }
        
        return res.status(200).json({ message: "Slot updated successfully", updatedSlot });

    } catch (error) {
        console.error("Error updating slot:", error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = { fetchSlots, addSlots, deleteSlot, updateSlot };
