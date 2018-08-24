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
        if (available) classList.push('free')
        else if (candidates.has(seat)) classList.push('option')
        else if (ownSeat == seat) classList.push('me')
        else classList.push('taken')
  
        html += `
          <li class="${classList.join(' ')}" id="${seat}">
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
    $(document).off('click', '.seat.free > label')
    $(document).on('click', '.seat.free > label', event => {
      const seatId = event.target.parentNode.id
      console.log(`Clicked on free seat ${event.target.parentNode.id}`)

      socket.emit('free', {
        flightCode: flightCode,
        oldSeat: ownSeat,
        newSeat: seatId
      })
      $('#newSeat').remove()
      $('#modal-swapped').modal('show')
      $('#modal-body-swapped').prepend(
        `<span id="newSeat"> You have swapped to ${seatId}. </span>`
      )

      $scope.FlightData.resetToNewSeat(seatId)
      active = false
      $scope.resetSockets()
    })

    $(".modal").on("hidden.bs.modal", function() {
      if ($('modal-body').id() == 'modal-body-swapped')
        console.log("hello123123")
        $(".modal-body").html("")
    })



    $(document).on('click', '.seat.option > label', event => {
      const toSeat = event.target.parentNode.id

      // get incoming request from data source
      const request = $scope.FlightData.findIncomingRequest(toSeat)

      // show accept modal
      showAcceptModal(toSeat, request)
    })

    $(document).on('click', '.seat.taken > label', event => {
      const seatId = event.target.parentNode.id

      showConfirmModal(seatId)
      $(document).off('click', '#confirm-swap')
      $(document).on('click', '#confirm-swap', function() {
        confirmSwap(seatId)
      })
      $('#companion1').click(function() { showFirstCompanion(); return false;})
      $('#companion2').click(function() { showSecondCompanion(); return false;})
    })

    $('#aisle-button').click(function() { showAisleModal(); return false;})
    $('#window-button').click(function() { showWindowModal(); return false;})
    $('.logout-icon').click(function() { showLogoutModal(); return false;})

    function showAcceptModal(seat, request) {
      $('#accept-details').remove()
      $('#modal-accept').modal('show')
      $('#modal-body-accept').prepend(`
        <span id="accept-details">Accept incoming seat swap from ${seat}?</span)
        `)

      $(document).off('click', '#modalAccept')
      $(document).on('click', '#modalAccept', event => {
        console.log(`emitting request`)
        console.log(request)
        socket.emit('accept', request) 

        $('#modal-accept').modal('hide')
      })
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
        companions: ['10B', '9B'],
        message: $('#swapMessage').val()
      }
  
      socket.emit('single-request', request)
    }
  }

  $scope.resetSockets = function() {
    let active = true
    $scope.FlightData.get().then(factory => {
      const { flightCode, flightSeat, plane, outgoing, incoming } = factory
  
      // Setup seat map
      setUpSeatMap(plane, incoming, flightSeat)
  
      // ---- Socket handlers ----- //
      socket.on(`${flightCode}/${flightSeat}-pending`, request => {
        if (!active) return
        $scope.FlightData.addOutgoingRequest(request)
      })
  
      $(document).off('click', '#requestWindow')
      $(document).on('click', '#requestWindow', event => {
        console.log('hello')
        for (let seat of plane.available) {
          if (plane.window.includes(seat.substring(seat.length - 1, seat.length))) {
            socket.emit('free', {
              flightCode: flightCode,
              oldSeat: flightSeat,
              newSeat: seat
            })

            $('#modal-swapped').modal('show')
            // $('#modal-body-swapped').prepend(
            //   `<span> ${seat} </span>`
            // )
      
            $scope.FlightData.resetToNewSeat(seat) 

           $('#newSeat').remove()
            $('#modal-body-swapped').prepend(
              `<span id="newSeat"> You have swapped to ${seat}. </span>`
            )
            $('#modal-swapped').modal('show')

            // // Change channel
            // active = false
            // $scope.resetSockets()
            return
          }
        }
  
        // socket.emit('multi-request', {
        //   flightCode: flightCode,
        //   fromSeat: flightSeat,
        //   category: 'window',
        //   companions: [],
        //   message: 'Preference for window seat'
        // })
      })
  
      socket.on(`${flightCode}/${flightSeat}-request`, request => {
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        handleNewRequest(request)
      })
  
      socket.on(`${flightCode}/aisle`, request => {
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        handleNewRequest(request)
      })
  
      socket.on(`${flightCode}/window`, request => {
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        handleNewRequest(request)
      })
  
      socket.on(`${flightCode}/${flightSeat}-accepted`, request => {
        if (!active) return

        // Parse request
        const { flightCode, fromSeat, toSeat, isSingle, companions, message } = request
        console.log(`accepted change to new seat ${toSeat}`)
  
        localStorage.setItem('flightSeat', toSeat)

        // Unsubscribe
        socket.emit('unsubscribe', {
          flightCode: flightCode,
          flightSeat: fromSeat
        })
  
        // Update data source
        $scope.FlightData.resetToNewSeat(toSeat)
        $scope.FlightData.get().then(factory => {
          const { flightCode, flightSeat, plane, outgoing, incoming } = factory
          setUpSeatMap(plane, incoming, flightSeat)

          // New subscription
          socket.emit('create', {
            flightCode: flightCode,
            flightSeat: flightSeat
          })
          // TODO Inssert you have changed seat modal 

          return
        })
      })
    

      socket.on(`${flightCode}/${flightSeat}-request`, request => {
        /**
         * 1. update data source
         * 2. seat map needs to reflect change
         */
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        handleNewRequest(request)
      })

      socket.on(`${flightCode}/aisle`, request => {
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        handleNewRequest(request)
      })

      socket.on(`${flightCode}/window`, request => {
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        handleNewRequest(request)
      })

      socket.on(`${flightCode}/${flightSeat}-accepted`, request => {
        if (!active) return

        // Parse request
        const { flightCode, fromSeat, toSeat, isSingle, companions, message } = request
        console.log(`accepted change to new seat ${toSeat}`)

        localStorage.setItem('flightSeat', toSeat)
        active = false
        $scope.resetSockets()
      }) 
  
      // YOUR request has been declined
      socket.on(`${flightCode}/${flightSeat}-declined`, request => {
        // Clear requests
      })
  
      socket.on(flightCode, available => {
        if (!active) return
        console.log('got new seat map with new available set')
        console.log(available)
        $scope.FlightData.setAvailable(available)
        $scope.FlightData.get().then(factory => {
          const { flightCode, flightSeat, plane, outgoing, incoming } = factory
          console.log(`my seat: ${flightSeat}`)
          setUpSeatMap(plane, incoming, flightSeat) 
        })
      })
  
      socket.on(`${flightCode}/${flightSeat}-init`, postings => {
        if (!active) return
        $scope.FlightData.replaceIncomingRequests(postings)
        for (let request of postings) handleNewRequest(request)
      })
  
      socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
        if (!active) return

        console.log(`${socket.id} reset to ${newSeat}`)
        localStorage.setItem('flightSeat', newSeat)
        $scope.FlightData.resetToNewSeat(newSeat)
  
        $scope.FlightData.get().then(factory => {
          const { flightCode, flightSeat, plane, outgoing, incoming } = factory
          setUpSeatMap(plane, incoming, flightSeat)

          // New subscription
          socket.emit('create', {
            flightCode: flightCode,
            flightSeat: flightSeat
          })

          active = false
          $scope.resetSockets()
        })
      })
  
      socket.emit('fetch', { flightCode: flightCode, flightSeat: flightSeat })
    })
  }

  $scope.resetSockets()

  function handleNewRequest(request) {
    const { flightCode, fromSeat, toSeat, isSingle, companions, message } = request

    // Debugging console logs
    const type = isSingle ? 'one-to-one' : 'one-to-many'
    console.log(`Received ${type} message from person at ${fromSeat}: ${message}`)

    // DOM update
    document.getElementById(fromSeat).className = 'seat option'
  }

}])
