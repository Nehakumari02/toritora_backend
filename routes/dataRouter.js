const { fetchModels, fetchUserInfo } = require('../controllers/dataController');
const router = require('express').Router();

router.get('/models',fetchModels)
router.get('/user',fetchUserInfo)

module.exports = router