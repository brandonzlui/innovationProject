module.exports = function(io) {
  io.on('connection', socket => {
    console.log(`${socket.id} connected`)
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
    })
  
    socket.on('create', data => {
      const { flightCode, flightSeat } = data
      socket.join(flightCode)
      socket.join(`${flightCode}/${flightSeat}`)
      socket.join(`${flightCode}/aisle`)
  
      console.log(`Creating data ${JSON.stringify(data)}`)
    })
  
    socket.on('request', data => {
      const { flightCode, fromSeat, toSeat, message } = data
  
      // build message to other guy
      io.emit(`${flightCode}/${toSeat}`, message)
    })
  })
}