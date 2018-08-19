$(document).ready(() => {
  joinChannels()

  $.ajax({
    url: `./api/seatMap/${localStorage.getItem('flightCode')}`,
    method: 'GET',
    async: true,
    success: seatMapSuccess,
    error: seatMapError
  })
})

function seatMapSuccess(plane, status, jqXHR) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  // Update cockpit
  document.getElementById('flightCode').innerHTML = localStorage.getItem('flightCode')
  document.getElementById('planeName').innerHTML = plane.name

  // Render seat map
  const cabin = document.getElementById('cabin')
  const ownSeat = localStorage.getItem('flightSeat')
  let html = ""

  for (let i = 0; i < plane.rows; ++i) {
    const rowNumber = String(i + 1)

    html += `<li class="row row--${rowNumber}">`
    html += `<ol class="seats" type="A">`
    for (let j = 0; j < plane.seatsPerRow; ++j) {
      const seat = rowNumber + letters[j]
      const available = plane.available.includes(seat)

      html += `
        <li class="seat ${available ? 'free' : ''} ${ownSeat == seat ? 'me' : ''}" id="${seat}">
          <input type="checkbox" />
          <label for="${seat}">${seat}</label>
        </li>
      `
    }

    html += `</ol>`
    html += `</li>`
  }

  cabin.innerHTML = html
  refreshSeats()
}

function seatMapError(jqXHR, status, error) {
  alert(`Seat map error: ${error}`)
}

function seatClicked(event) {
  let flightCode = localStorage.getItem('flightCode')
  let flightSeat = localStorage.getItem('flightSeat')

  socket.emit('single-request', {
    flightCode: flightCode,
    fromSeat: flightSeat,
    toSeat: event.target.parentNode.id,
    companions: [],
    message: 'Please swap'
  })
}

function refreshSeats() {
  $(document).off('click', '.seat > label').on('click', '.seat > label', seatClicked)
}