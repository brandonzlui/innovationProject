

app.controller('SeatMapController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  $scope.FlightData = FlightData

  function setUpSeatMap(plane, incoming, ownSeat) {
    const candidates = new Set(incoming.map(request => request.fromSeat))
    const letters = ['A', 'B', 'C', 'D', 'E', 'F']
  
    // Update cockpit
    const flightCode = localStorage.getItem('flightCode')
    document.getElementById('flightCode').innerHTML = flightCode
    document.getElementById('mySeat').innerHTML = `My seat: ${ownSeat}`
  
    // Render seat map
    const cabin = document.getElementById('cabin')
    let html = ""
  
    for (let i = 0; i < plane.rows; ++i) {
      const rowNumber = String(i + 1)
  
      html += `<li class="row row--${rowNumber}">`
      html += `<ol class="seats" type="A">`
      for (let j = 0; j < plane.seatsPerRow; ++j) {
        const seat = rowNumber + letters[j]
        const available = plane.available.includes(seat)
  
        const classList = ['seat']
        classList.push(available ? 'free' : 'taken')
        if (candidates.has(seat)) classList.push('option')
        if (ownSeat == seat) classList.push('me')
  
        html += `
          <li class="seat ${classList.join(' ')}" id="${seat}">
            <input type="checkbox" />
            <label for="${seat}">${seat}</label>
          </li>
        `
      }
  
      html += `</ol>`
      html += `</li>`
    }
  
    cabin.innerHTML = html
  
    // Reset listeners
    $(document).off('click', '.seat > label')
  
    // Cannot press on my own seat
    $(`#${ownSeat} > input`).prop('disabled', true)
  
    // Click listener for AVAILABLE seat
    $(document).on('click', '.seat.free > label', event => console.log(`Clicked on free seat ${event.target.parentNode.id}`))
  
    // Click listener for TAKEN seat
    $(document).on('click', '.seat.taken > label', event => {
      console.log(`Want to take seat ${event.target.parentNode.id}`)
  
      const request = {
        flightCode: flightCode,
        fromSeat: ownSeat,
        toSeat: event.target.parentNode.id,
        companions: [],
        message: 'Please swap'
      }
  
      $scope.FlightData.addOutgoingRequest(request)
      socket.emit('single-request', request)
    })

    $(document).on('click', '.seat > label', function(e){
      showModal(e.target.parentNode.id)
    });

    function showModal(seat){
        $("#details").remove()
        $("#confirm-swap").modal('show')
        $("#confirm-body").prepend(`
        <div id="details">Do you want to swap ${seat} for ${ownSeat}</div>
        `)
    }
  }

  $scope.FlightData.get().then(factory => {
    const { flightCode, flightSeat, plane, outgoing, incoming } = factory

    // Setup seat map
    setUpSeatMap(plane, incoming, flightSeat)
    
    socket.on(`${flightCode}/${flightSeat}`, data => {
      const { flightCode, fromSeat, toSeat, isSingle, message } = data
  
      const type = isSingle ? 'one-to-one' : 'one-to-many'
      console.log(`Received ${type} message from person at ${fromSeat}: ${message}`)
  
      $scope.FlightData.addIncomingRequest(data)
      
      $scope.FlightData.get().then(factory => {
        const { flightCode, flightSeat, plane, outgoing, incoming } = factory
        setUpSeatMap(plane, incoming, flightSeat)
      })
    })
    
    socket.on(`${flightCode}/${flightSeat}-init`, data => {
      console.log(data)
    })
  })
}])