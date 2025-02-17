const { googleLogin, googleSignup, Signin, Signup, Logout } = require('../controllers/authController');

const router = require('express').Router();

router.post('/google/signup',googleSignup)
router.post('/google/signin',googleLogin)
router.post('/signin',Signin)
router.post('/signup',Signup)
router.post('/logout',Logout)

module.exports = router