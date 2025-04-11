const mongoose = require('mongoose')
const { authenticateUser } = require("../utils/authenticate");
const UserModel = require('../models/userModel');
const Reservation = require('../models/reservationModel');
const Transaction = require('../models/transactionModel');
const Earning = require('../models/earningModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentSession = async (req, res) => {
    try {
      const { _id, email } = await authenticateUser(req,res);
      const { reservationId } = req.body;
      // Fetch reservation details from MongoDB
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Calculate the total amount (convert to cents)
      const totalAmount = reservation.fees * 100;

      // Create a Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Reservation for`,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.ORIGIN}/reservation/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.ORIGIN}/reservation/payment/fail`,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createPaymentIntent = async (req, res) => {

  try {
    const { _id, email } = await authenticateUser(req,res);
    const { reservationId } = req.body;
      // Fetch reservation details from MongoDB
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Calculate the total amount (convert to cents) for usd only
    // const totalAmount = reservation.fees * 100;
    const totalAmount = reservation.fees;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'jpy',
    //   automatic_payment_methods: { enabled: true },
      payment_method_types: ['card'],
      metadata: {
        reservationId: reservationId.toString(),
        senderId: _id.toString(),
        recipientId: reservation.user_id.toString(),
        // customNote: 'Payment for booking',
      },
    });

    console.log("[a",paymentIntent)

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

const paymentStatusMapping = {
    succeeded: 'paid',
    requires_payment_method: 'failed',
    requires_action: 'pending',
    processing: 'pending',
    requires_capture: 'pending',
    canceled: 'failed',
  };

const verifyPayment = async (req,res) =>{
    const { paymentIntentId } = req.body;
    const session = await mongoose.startSession();

  try {
    const { _id, email } = await authenticateUser(req,res);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    session.startTransaction();

    const reservationId = paymentIntent.metadata.reservationId;
    const senderId = paymentIntent.metadata.senderId;
    const recipientId = paymentIntent.metadata.recipientId;
    const stripeStatus = paymentIntent.status;
    const paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';
    const amount_received = paymentIntent.amount_received;

      if (paymentIntent.status === 'succeeded') {
      const updatedReservation = await Reservation.findByIdAndUpdate(
          reservationId,
          {
            payment_mode: paymentMethod,
            payment_id: paymentIntentId,
            payment_status: paymentStatusMapping[stripeStatus] || 'pending',
          },
          { session }
        );

        await Transaction.create(
          [{
            sender_id: senderId,
            recipient_id: recipientId,
            payment_id: paymentIntentId,
            payment_status: 'success',
            amount: amount_received,
          }],
          { session }
        );

        await Earning.findOneAndUpdate(
          { user_id: recipientId },
          { $inc: { total_earned: amount_received } },
          { upsert: true, new: true, session }
        );
      
        await Earning.findOneAndUpdate(
          { user_id: senderId },
          { $inc: { total_spent: amount_received } },
          { upsert: true, new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.json({ success: true, message: 'Payment verified', amount: paymentIntent.amount_received });
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Payment not verified' });
      }
  } catch (error) {
    console.error('Error verifying payment:', error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const getPaymentHistory = async (req, res) => {
  try {
    const { _id: userId } = await authenticateUser(req, res);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      $or: [
        { sender_id: userId },
        { recipient_id: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // .populate('sender_id', 'name email')
      // .populate('recipient_id', 'name email');

    const totalCount = await Transaction.countDocuments({
      $or: [
        { sender_id: userId },
        { recipient_id: userId },
      ],
    });

    return res.json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      transactions,
      userId
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getEarningHistory = async (req, res) => {
  try {
    const { _id: userId } = await authenticateUser(req, res);

    const earning = await Earning.findOne({ user_id: userId });

    if (!earning) {
      return res.status(404).json({
        success: false,
        message: 'Earning record not found',
      });
    }

    return res.json({
      success: true,
      total_earned: earning.total_earned,
      total_spent: earning.total_spent,
      total_withdrawn: earning.total_withdrawn,
      updatedAt: earning.updatedAt,
    });

  } catch (error) {
    console.error('Error fetching earning history:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { createPaymentSession, createPaymentIntent, verifyPayment, getPaymentHistory, getEarningHistory };
