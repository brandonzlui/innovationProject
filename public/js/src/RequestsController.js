app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('RequestsController loaded!')
  $scope.FlightData = FlightData
  $scope.myRequests = []

  $scope.resetSockets = function() {
    let active = true
    $scope.FlightData.get().then(data => {
      const { flightCode, flightSeat, outgoing } = data
      $scope.myRequests = outgoing

      socket.on(`${flightCode}/${flightSeat}-pending`, request => {
        if (!active) return
        $scope.FlightData.get().then(data => {
          $scope.myRequests = data.outgoing
        })
      })
  
      socket.on(`${flightCode}/${flightSeat}-accepted`, updatedRequest => {
        if (!active) return

        // Reset seat map
        if (updatedRequest.isSingle) {
          $scope.FlightData.resetToNewSeat(updatedRequest.toSeat)
        }

        active = false
        $scope.resetSockets()
      })

      socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
        if (!active) return
        setTimeout(() => {
          active = false
          $scope.resetSockets()
        }, 500)
      })

      socket.on(`${flightCode}/${flightSeat}-declined`, updatedRequest => {
        if (!active) return
        
        // Change status
        $scope.FlightData.receivedDecline(updatedRequest)
        $scope.FlightData.get().then(data => {
          $scope.myRequests = data.outgoing
        })
      })
    })  
  }

  $scope.resetSockets()

}])