const socket = io()

let flightCode = localStorage.getItem('flightCode')
let flightSeat = localStorage.getItem('flightSeat')

socket.emit('create', {
  flightCode: localStorage.getItem('flightCode'),
  flightSeat: localStorage.getItem('flightSeat')
})

function testSocket(otherSeat, message) {
  socket.emit('request', {
    flightCode: flightCode, 
    fromSeat: flightSeat,
    toSeat: otherSeat,
    message: message
  })
}

socket.on(`${flightCode}/${flightSeat}`, message => {
  alert(`Received message for seat: ${message}`)
})