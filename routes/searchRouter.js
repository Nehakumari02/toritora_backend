const { searchWithFilter } = require('../controllers/searchController');
const router = require('express').Router();

router.get('/', searchWithFilter)

module.exports = router