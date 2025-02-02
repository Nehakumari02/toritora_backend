const { google } = require('googleapis');
const { googleLogin } = require('../controllers/authController');

const router = require('express').Router();

router.get('/test', (req,res)=>{
    res.send('test')
})

router.post('/google',googleLogin)

module.exports = router