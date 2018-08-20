

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

    $(".modal").on("hidden.bs.modal", function(){
      $(".modal-body").html("");
    });

    $(document).on('click', '.seat > label', function(e){
      showModal(e.target.parentNode.id)
      $(document).on('click', '#confirm-swap', function(){
        confirmSwap(e.target.parentNode.id)
      })
      $('#companion1').click(function() { showFirstCompanion(); return false;})
      $('#companion2').click(function() { showSecondCompanion(); return false;})

    });

    function showModal(seat){
      $("#details").remove()
      $("#confirm-swap-modal").modal('show')
      $("#confirm-body").prepend(`
        <span id="details">Complete the following form to make a request for swapping from ${ownSeat} to ${seat}.
        <div class="vs4"></div>
        <div class="form-group">
                    <label for="message">Message</label>
                    <input type="text" class="form-control" placeholder="Enter a message">
                </div>
                <div class="vs4"></div>
                <a id="companion1" href="#">Click here to add a companion.</a>
                <div class="vs4"></div>
                <a id="companion2" href="#"></a>
            </div>
        </span>
      `)
    }

    function showFirstCompanion(){
      $("#companion1").empty();
      $("#companion1").removeAttr("href");
      $("#companion1").prepend(`<span>10B CHAN TAI MING</span>`);
      $("#companion2").prepend(`<span>Click here to add a companion.</span>`);
    }

    function showSecondCompanion(){
      $("#companion2").empty();
      $("#companion2").removeAttr("href");
      $("#companion2").prepend(`<span>9B TANG CHUN MING</span>`)
    }
    
    function confirmSwap(seat){
        $('#confirm-swap-modal').modal('hide')
        console.log(`Want to take seat ${seat}`)
    
        const request = {
          flightCode: flightCode,
          fromSeat: ownSeat,
          toSeat: seat,
          companions: [],
          message: 'Please swap'
        }
    
        $scope.FlightData.addOutgoingRequest(request)
        socket.emit('single-request', request)
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