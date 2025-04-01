const { fetchRequests, addRequest, deleteRequest, acceptRequest } = require('../controllers/bookingController');
const { fetchReservations, fetchSingleReservation } = require('../controllers/reservationController');
const router = require('express').Router();

router.get('/',fetchReservations)
router.get('/reservation',fetchSingleReservation)
router.post('/',addRequest)
router.delete('/',deleteRequest)
router.post('/accept', acceptRequest)

module.exports = router