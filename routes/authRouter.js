const { google } = require('googleapis');
const { googleLogin, googleSignup, Signin, Signup } = require('../controllers/authController');

const router = require('express').Router();

router.post('/google/signup',googleSignup)
router.post('/google/signin',googleLogin)
router.post('/signin',Signin)
router.post('/signup',Signup)

module.exports = router