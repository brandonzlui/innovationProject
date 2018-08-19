const cxData = require('../models/DataSource').getInstance()

function getSeatMap(req, res, next) {
  const [err, seatMap] = cxData.getSeatMap(req.params.flightCode)
  if (err) return next(err)

  res.status(200).json(seatMap)
}

module.exports = {
  getSeatMap: getSeatMap
}