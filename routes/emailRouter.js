const { sendVerificationCode, sendResetPasswordCode } = require('../controllers/emailController');

const router = require('express').Router();

router.post('/verificationCode',sendVerificationCode)

router.post('/resetPasswordCode',sendResetPasswordCode)

module.exports = router