const { createPaymentSession, createPaymentIntent, verifyPayment, getPaymentHistory, getEarningHistory } = require('../controllers/paymentsController');

const router = require('express').Router();

router.post('/create-payment-session', createPaymentSession)
router.post('/create-payment-intent', createPaymentIntent)
router.post('/verify-payment',verifyPayment)
router.get('/payment', getPaymentHistory)
router.get('/earnings', getEarningHistory)

module.exports = router 