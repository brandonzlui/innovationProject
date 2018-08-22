/**
 * LEGEND:
 * .free := seat available
 * .taken := seat not available
 * .option := seat up for swap (that person is asking you)
 * .me := your seat
 */

app.controller('SeatMapController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('SeatMapController loaded!')
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

    $(".modal").on("hidden.bs.modal", function() {
      $(".modal-body").html("")
    })

    $(document).on('click', '.seat > label', function(event) {
      const seatId = event.target.parentNode.id

      // if pending, show accept modal
      if ($(event.target).is('.seat.me > label')){}
      else if ($(event.target).is('.seat.taken.option > label')) {
        showAcceptModal(seatId)
      } else {

        showConfirmModal(seatId)
        $(document).off('click', '#confirm-swap')
        $(document).on('click', '#confirm-swap', function() {
          confirmSwap(seatId)
        })

        $('#companion1').click(function() { showFirstCompanion(); return false;})
        $('#companion2').click(function() { showSecondCompanion(); return false;})
      }
    });

    $('#aisle-button').click(function() { showAisleModal(); return false;})
    $('#window-button').click(function() { showWindowModal(); return false;})
    $('.logout-icon').click(function() { showLogoutModal(); return false;})

    function showAcceptModal(seat){
      $('#accept-details').remove()
      $('#modal-accept').modal('show')
      $('#modal-body-accept').prepend(`
        <span id="accept-details">Accept incoming seat swap from ${seat}?</span)
        `)
    }
    function showConfirmModal(seat){
      $("#details").remove()
      $("#confirm-swap-modal").modal('show')
      $("#confirm-body").prepend(`
        <span id="details">Complete the following form to make a request for swapping from ${ownSeat} to ${seat}.
          <div class="vs4"></div>
          <div class="form-group">
            <label for="message">Message</label>
            <input type="text" class="form-control" placeholder="Enter a message" id="swapMessage">
          </div>
          <div class="vs4"></div>
          <a id="companion1" href="#">Click here to add a companion.</a>
          <div class="vs4"></div>
          <a id="companion2" href="#"></a>
          </div>
        </span>
      `)
    }

    function showAisleModal() {
      $("#modal-body-aisle").empty();
      $("#modal-aisle").modal('show');
      $("#modal-body-aisle").prepend(`<span>Are you sure you want to request for an <b>aisle seat</b>? You will be allocated to the frontmost aisle seat if they are available.</span>`);
    }

    function showWindowModal() {
      $("#modal-body-window").empty();
      $("#modal-window").modal('show');
      $("#modal-body-window").prepend(`<span>Are you sure you want to request for a <b>window seat</b>? You will be allocated to the frontmost window seat if they are available.</span>`);
    }

    function showLogoutModal() {
      $("#modal-body-logout").empty();
      $("#logoutModal").modal('show');
      $("#modal-body-logout").prepend(`<span>Are you sure you want to logout?</span>`);
    }


    function showFirstCompanion(){
      $("#companion1").empty();
      $("#companion1").removeAttr("href");
      $("#companion1").prepend(`<span>10B</span>`);
      $("#companion1").off();
      $("#companion2").prepend(`<span>Click here to add a companion.</span>`);
      
    }

    function showSecondCompanion(){
      $("#companion2").empty();
      $("#companion2").removeAttr("href");
      $("#companion2").prepend(`<span>9B</span>`)
    }
    
    function confirmSwap(seat) {
      $('#confirm-swap-modal').modal('hide')
      console.log(`Want to take seat ${seat}`)
  
      const request = {
        flightCode: flightCode,
        fromSeat: ownSeat,
        toSeat: seat,
        companions: [],
        message: $('#swapMessage').val()
      }
  
      socket.emit('single-request', request)
    }
  }

  $scope.FlightData.get().then(factory => {
    const { flightCode, flightSeat, plane, outgoing, incoming } = factory

    // Setup seat map
    setUpSeatMap(plane, incoming, flightSeat)

    // ---- Socket handlers ----- //
    socket.on(`${flightCode}/${flightSeat}-pending`, request => {
      $scope.FlightData.addOutgoingRequest(request)
    })

    socket.on(`${flightCode}/${flightSeat}-request`, request => {
      /**
       * 1. update data source
       * 2. seat map needs to reflect change
       */
      $scope.FlightData.addIncomingRequest(request)
      handleNewRequest(request)
    })

    socket.on(`${flightCode}/aisle`, request => {
      $scope.FlightData.addIncomingRequest(request)
      handleNewRequest(request)
    })

    socket.on(`${flightCode}/window`, request => {
      $scope.FlightData.addIncomingRequest(request)
      handleNewRequest(request)
    })

    // TODO
    socket.on(`${flightCode}/${flightSeat}-accepted`, request => {
      // Parse request
      const { flightCode, fromSeat, toSeat, isSingle, companions, message } = request
      console.log(`accepted change to new seat ${toSeat}`)

      localStorage.setItem('flightSeat', toSeat)

      // Update data source
      $scope.FlightData.resetToNewSeat(toSeat)
      $scope.FlightData.get().then(factory => {
        const { flightCode, flightSeat, plane, outgoing, incoming } = factory
        setUpSeatMap(plane, incoming, flightSeat)
      })
    })

    // TODO
    socket.on(`${flightCode}/${flightSeat}-declined`, request => {
      
    })

    socket.on(flightCode, available => {
      // Reset all available seats
      const oldFrees = document.getElementsByClassName('seat free')
      for (let i = 0; i < oldFrees.length; ++i) {
        oldFrees[i].className = 'seat taken'
      }

      // Loop through and add new availables
      for (let i = 0; i < available.length; ++i) {
        available[i].className = 'seat free'
      }
    })

    socket.on(`${flightCode}/${flightSeat}-init`, postings => {
      $scope.FlightData.replaceIncomingRequests(postings)
      for (let request of postings) handleNewRequest(request)
    })

    socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
      $scope.FlightData.resetToNewSeat(newSeat)
      localStorage.setItem('flightSeat', newSeat)
    })

    socket.emit('fetch', { flightCode: flightCode, flightSeat: flightSeat })

    

  })


  function handleNewRequest(request) {
    const { flightCode, fromSeat, toSeat, isSingle, companions, message } = request

    // Debugging console logs
    const type = isSingle ? 'one-to-one' : 'one-to-many'
    console.log(`Received ${type} message from person at ${fromSeat}: ${message}`)

    // DOM update
    document.getElementById(fromSeat).className = 'seat option'
  }

}])