const { saveUserDetails } = require('../controllers/registrationController');
const { saveUserProfession } = require('../controllers/registrationController');

const router = require('express').Router();

router.post('/userProfession', saveUserProfession)
router.post('/userDetails', saveUserDetails)

module.exports = router 