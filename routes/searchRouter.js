const { fetchUser, updateUser } = require('../controllers/profileController');
const router = require('express').Router();

router.get('/user',fetchUser)
router.post('/user',updateUser)

module.exports = router