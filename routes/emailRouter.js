const { sendVerificationCode } = require('../controllers/emailController');

const router = require('express').Router();

router.post('/verificationCode',sendVerificationCode)

module.exports = router