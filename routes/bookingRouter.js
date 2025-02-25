const { fetchRequests, addRequest, deleteRequest, acceptRequest } = require('../controllers/bookingController');
const router = require('express').Router();

router.get('/',fetchRequests)
router.post('/',addRequest)
router.delete('/',deleteRequest)
router.post('/accept', acceptRequest)

module.exports = router