const router = require('express').Router()
const apiController = require('../controllers/apiController')

router.get('/seatMap/:flightCode', apiController.getSeatMap)

module.exports = router