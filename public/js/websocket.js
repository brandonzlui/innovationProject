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

socket.on(`${flightCode}/${flightSeat}-init`, data => {
  console.log(data)
})