const mongoose = require('mongoose')
const Request = require("../models/requestModel");
const Slot = require("../models/slotModel");
const { authenticateUser } = require("../utils/authenticate");
const UserModel = require('../models/userModel');
const Reservation = require('../models/reservationModel');

const fetchRequests = async (req, res) => {
    try {
        const { _id: user_id } = await authenticateUser(req, res);

        const sentRequests = await Request.find({ user_id_2: user_id })
            .populate("user_id", "firstName lastName profilePicture")
            .sort({ createdAt: -1 });

        const receivedRequests = await Request.find({ user_id: user_id })
            .populate("user_id_2", "firstName lastName profilePicture")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Booking requests fetched successfully",
            received: receivedRequests,
            sent: sentRequests
        });

    } catch (error) {
        console.error("Error in fetching requests:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const addRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { slot_id, ...formData } = req.body;
        const { _id: user_id_2 } = await authenticateUser(req, res);

        if (!slot_id) {
            return res.status(400).json({ message: "Slot ID is required" });
        }

        const slot = await Slot.findById(slot_id).session(session);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        if (slot.status === "pending") {
            return res.status(400).json({ message: "Slot is already booked" });
        }

        const newRequest = new Request({
            slot_id,
            user_id: slot.user_id,
            user_id_2,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: "pending",
            ...formData,
            editRequestStatus: "none"
        });

        await newRequest.save({ session });

        slot.status = "pending";
        await slot.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Booking request added successfully",
            request: newRequest
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error in adding request:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const deleteRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { request_id, cancelledBy } = req.body;
        const { _id: user_id } = await authenticateUser(req, res);

        if (!request_id || !cancelledBy) {
            return res.status(400).json({ message: "Request ID and cancelledBy field are required" });
        }

        const request = await Request.findById(request_id).session(session);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.user_id.toString() !== user_id.toString() && request.user_id_2.toString() !== user_id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (cancelledBy === "sender" && request.user_id_2.toString() === user_id.toString()) {
            request.status = "cancelled_by_sender";
        } else if (cancelledBy === "receiver" && request.user_id.toString() === user_id.toString()) {
            request.status = "rejected";
        } else {
            return res.status(400).json({ message: "Invalid cancelledBy value" });
        }

        await request.save({ session });

        const slot = await Slot.findById(request.slot_id).session(session);
        if (slot) {
            slot.status = "available";
            await slot.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Booking request cancelled successfully",
            request
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error in cancelling request:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { request_id } = req.body;
        const { _id: user_id } = await authenticateUser(req, res);

        if (!request_id) {
            return res.status(400).json({ message: "Request ID is required" });
        }

        const request = await Request.findById(request_id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.user_id.toString() !== user_id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const slot = await Slot.findById(request.slot_id);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            request.status = "approved";
            await request.save({ session });

            slot.status = "booked";
            await slot.save({ session });

            const allowedFields = [
                "shootingPlace", "shootingLocation", "meetingPoint", "shootingConcept",
                "clothingType", "shoesType", "itemsType", "makeUpType",
                "shootingPlaceRainy", "shootingLocationRainy", "meetingPointRainy",
                "shootingConceptRainy", "clothingTypeRainy", "shoesTypeRainy",
                "itemsTypeRainy", "makeUpTypeRainy"
            ];

            const requestFields = Object.keys(request._doc).reduce((acc, key) => {
                if (allowedFields.includes(key)) {
                    acc[key] = request[key];
                }
                return acc;
            }, {});

            const user = await UserModel.findById(slot.user_id).session(session);

            const newReservation = new Reservation({
                user_id: slot.user_id,
                user_id_2: request.user_id_2,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                location: user.location || "",
                fees: user.shootingPrice || 0,
                transportation_fees: user.transportationFee || 0,
                payment_status: "pending",
                reservation_status: "pending",
                ...requestFields,
            });

            await newReservation.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Booking request approved successfully",
                request,
                slot
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        console.error("Error in approving request:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

module.exports = { fetchRequests, addRequest, deleteRequest, acceptRequest };
