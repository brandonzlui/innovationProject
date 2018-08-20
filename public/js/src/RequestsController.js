app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  $scope.FlightData = FlightData
  $scope.myRequests = []

  $scope.FlightData.get().then(data => {
    const { flightCode, flightSeat, pending } = data

    console.log(`[requestCtrl] refreshed data`)
    $scope.myRequests = pending

    socket.on(`${flightCode}/${flightSeat}-seatmap`, data => {
      $scope.FlightData.get().then(data => {
        const { pending } = data
        $scope.myRequests = pending

        console.log(`myRequest: `)
        console.log($scope.myRequests)
      })
    })
  })  
}])