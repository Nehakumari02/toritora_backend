const { googleLogin, googleSignup, Signin, Signup, Logout, ResetPassword, VerifyResetPasswordToken } = require('../controllers/authController');

const router = require('express').Router();

router.post('/google/signup',googleSignup)
router.post('/google/signin',googleLogin)
router.post('/signin',Signin)
router.post('/signup',Signup)
router.post('/logout',Logout)
router.post('/resetPassword',ResetPassword)
router.post('/verifyResetPasswordToken',VerifyResetPasswordToken)

module.exports = router