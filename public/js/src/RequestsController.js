app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('RequestsController loaded!')
  $scope.FlightData = FlightData
  $scope.myRequests = []

  $scope.resetSockets = function() {
    $scope.FlightData.get().then(data => {
      const { flightCode, flightSeat, outgoing } = data
      $scope.myRequests = outgoing

      socket.on(`${flightCode}/${flightSeat}-pending`, request => {
        $scope.FlightData.get().then(data => {
          $scope.myRequests = data.outgoing
        })
      })
  
      socket.on(`${flightCode}/${flightSeat}-accepted`, updatedRequest => {
        // Reset seat map
        if (updatedRequest.isSingle) {
          $scope.FlightData.resetToNewSeat(updatedRequest.toSeat)
        }

        $scope.resetSockets()
      })

      socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
        setTimeout(() => $scope.resetSockets(), 500)
      })

      socket.on(`${flightCode}/${flightSeat}-declined`, updatedRequest => {
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