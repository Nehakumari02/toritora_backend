const { fetchFavourite, updateFavourite, deleteFavourite } = require('../controllers/favouriteController');
const router = require('express').Router();

router.get('/',fetchFavourite)
router.post('/',updateFavourite)
router.delete('/',deleteFavourite)

module.exports = router