const socket = io()

// Join [flight | seat | category] channels
function joinChannels() {
  socket.emit('create', {
    flightCode: localStorage.getItem('flightCode'),
    flightSeat: localStorage.getItem('flightSeat')
  })
}



let flightCode = localStorage.getItem('flightCode')
let flightSeat = localStorage.getItem('flightSeat')



function testSocket(otherSeat, message) {
  socket.emit('request', {
    flightCode: flightCode, 
    fromSeat: flightSeat,
    toSeat: otherSeat,
    message: message
  })
}

socket.on(`${flightCode}/${flightSeat}`, data => {
  const { flightCode, fromSeat, toSeat, message } = data
  console.log(`Received message from person at ${fromSeat}: ${message}`)
  document.getElementById(fromSeat).className = 'seat option'
})