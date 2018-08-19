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

socket.on(`${flightCode}/${flightSeat}`, data => {
  const { flightCode, fromSeat, toSeat, isSingle, message } = data

  const type = isSingle ? 'one-to-one' : 'one-to-many'
  console.log(`Received ${type} message from person at ${fromSeat}: ${message}`)
  document.getElementById(fromSeat).className = 'seat option'
})