const mongoose = require('mongoose')
const { authenticateUser } = require("../utils/authenticate");
const UserModel = require('../models/userModel');
const Reservation = require('../models/reservationModel');
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
        reservationId: reservationId,
        userId: _id,
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

  try {
    const { _id, email } = await authenticateUser(req,res);
    // Fetch payment details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const reservationId = paymentIntent.metadata.reservationId;
    const userId = paymentIntent.metadata.userId;
    const stripeStatus = paymentIntent.status;
    const paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';

    // Expected amount (e.g., fetch from your DB based on reservation)

    if (paymentIntent.status === 'succeeded') {
      // Update payment status in your database
    //   await updatePaymentStatus(paymentIntentId, 'PAID');
    const updatedReservation = await Reservation.findByIdAndUpdate(
        reservationId,
        {
          payment_mode: paymentMethod,
          payment_id: paymentIntentId,
          payment_status: paymentStatusMapping[stripeStatus] || 'pending',
        },
      );

      return res.json({ success: true, message: 'Payment verified', amount: paymentIntent.amount_received });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not verified' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { createPaymentSession,createPaymentIntent, verifyPayment };
