const { createPaymentSession, createPaymentIntent, verifyPayment } = require('../controllers/paymentsController');

const router = require('express').Router();

router.post('/create-payment-session', createPaymentSession)
router.post('/create-payment-intent', createPaymentIntent)
router.post('/verify-payment',verifyPayment)
// router.post('/payment', )

module.exports = router 