app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('PostingController loaded!')
  $scope.FlightData = FlightData

  $scope.$on('ngRepeatFinished', () => {
    updateButtonListeners()
  })

  $scope.FlightData.get().then(flightData => {
    const { flightCode, flightSeat, incoming } = flightData
    $scope.requests = incoming
    updateButtonListeners()

    socket.on(`${flightCode}/${flightSeat}-request`, request => {
      $scope.FlightData.addIncomingRequest(request)
      $scope.FlightData.get().then(data => {
        $scope.requests = data.incoming
        updateButtonListeners()
      })
    })

    socket.on(`${flightCode}/${flightSeat}-pending`, request => {
      $scope.FlightData.addOutgoingRequest(request)
    }) 

    socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
      $scope.FlightData.resetToNewSeat(newSeat)

      setTimeout(() => $state.go('seatmap'), 2000)
    })
  })

  function updateButtonListeners() {
    // Remove previous event listeners
    $(document).off('click', '.acceptBtn')
    $(document).off('click', '.declineBtn')

    const acceptButtons = document.getElementsByClassName('acceptBtn')
    for (let i = 0; i < acceptButtons.length; ++i) {
      acceptButtons[i].addEventListener('click', event => {
        const id = event.target.id
        const request = JSON.parse(id.substring(0, id.length - 2))
        
        socket.emit('accept', request)
      })
    }
  }
}])