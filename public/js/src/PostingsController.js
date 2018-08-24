app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('PostingController loaded!')
  $scope.FlightData = FlightData

  $scope.$on('ngRepeatFinished', () => {
    updateButtonListeners()
  })

  $scope.resetSockets = function() {
    let active = true
    $scope.FlightData.get().then(flightData => {
      const { flightCode, flightSeat, incoming } = flightData
      $scope.requests = incoming
      updateButtonListeners()
  
      socket.on(`${flightCode}/${flightSeat}-request`, request => {
        if (!active) return
        $scope.FlightData.addIncomingRequest(request)
        $('#newRequestSpan').html(request.fromSeat)
        $('#newRequestModal').modal('show')
        $scope.FlightData.get().then(data => {
          $scope.requests = data.incoming
          updateButtonListeners()
        })
      })
  
      socket.on(`${flightCode}/${flightSeat}-pending`, request => {
        if (!active) return
        $scope.FlightData.addOutgoingRequest(request)
      }) 
  
      socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
        if (!active) return
        $scope.FlightData.resetToNewSeat(newSeat)

        active = false
        $scope.resetSockets()
      })

      socket.on(`${flightCode}/${flightSeat}-cancelled`, request => {
        if (!active) return
        $scope.FlightData.receivedCancel(request)
        $scope.FlightData.get().then(data => {
          $scope.requests = data.incoming
          updateButtonListeners()
        })
      })
    })
  }

  $scope.resetSockets()

  function updateButtonListeners() {
    // Remove previous event listeners
    $(document).off('click', '.acceptBtn')
    $(document).off('click', '.declineBtn')

    const acceptButtons = document.getElementsByClassName('acceptBtn')
    for (let i = 0; i < acceptButtons.length; ++i) {
      acceptButtons[i].addEventListener('click', event => {
        const id = event.target.id
        const request = JSON.parse(id.substring(0, id.length - 2))
        $(`#respondModal-${request.fromSeat}-${request.toSeat}`).modal('hide')
        
        setTimeout(() => {
          socket.emit('accept', request)
          $scope.resetSockets()
        }, 500)
      })
    }
  }
}])