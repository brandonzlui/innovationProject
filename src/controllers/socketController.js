const CXAdapter = require('../adapters/CXAdapter')
const cxData = new CXAdapter()

module.exports = function(io) {
  io.on('connection', socket => {
    console.log(`${socket.id} connected`)
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
    })
  
    socket.on('create', data => {
      const { flightCode, flightSeat } = data

      // Join flight channel
      socket.join(flightCode)

      // Join seat channel
      socket.join(`${flightCode}/${flightSeat}`)

      // Get plane data
      const [_, seatMap] = cxData.getSeatMap(flightCode)
      const col = flightSeat.slice(-1)
      if (col in seatMap.aisle) socket.join(`${flightCode}/aisle`)
      else if (col in seatMap.window) socket.join(`${flightCode}/window`)
  
      console.log(`Creating data ${JSON.stringify(data)}`)
    })
  
    socket.on('request', data => {
      const { flightCode, fromSeat, toSeat, message } = data
  
      // build message to other guy
      console.log(`Emitting to channel ${flightCode}/${toSeat}`)
      io.emit(`${flightCode}/${toSeat}`, data)
    })

    socket.on('cancel', data => {
      // TODO propagate request cancelation to correct channels
    })
  })
}