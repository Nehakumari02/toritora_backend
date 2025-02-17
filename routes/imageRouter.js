const { getUploadUrl, deleteUploadedFile } = require('../controllers/imageController');
const router = require('express').Router();

router.post('/uploadUrl',getUploadUrl)
router.delete('/',deleteUploadedFile)

module.exports = router