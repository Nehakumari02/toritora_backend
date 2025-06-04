const { fetchUser, updateUser, fetchUserGallery } = require('../controllers/profileController');
const router = require('express').Router();

router.get('/user',fetchUser)
router.get('/user/gallery',fetchUserGallery)
router.post('/user',updateUser)

module.exports = router