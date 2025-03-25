const { fetchRequests, addRequest, deleteRequest, acceptRequest } = require('../controllers/bookingController');
const { fetchReservations } = require('../controllers/reservationController');
const router = require('express').Router();

router.get('/',fetchReservations)
router.post('/',addRequest)
router.delete('/',deleteRequest)
router.post('/accept', acceptRequest)

module.exports = router