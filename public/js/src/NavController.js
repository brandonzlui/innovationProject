app.controller('NavController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('NavController loaded!')
  $scope.sections = [
    {
      title: 'Seat Map',
      stateName: 'seatmap' ,
      hasBadge: false
    },
    {
      title: 'Postings',
      stateName: 'postings',
      hasBadge: true,
      count: 0
    },
    {
      title: 'My Requests',
      stateName: 'requests',
      hasBadge: true,
      count: 0
    }
  ]

  $scope.changeState = function(stateName) {
    $state.go(stateName)
  }

  $scope.FlightData = FlightData

  $scope.FlightData.get().then(data => {
    const { flightSeat, flightCode, pending } = data
    $scope.sections[2].count = pending.length

    socket.on(`${flightCode}/${flightSeat}-pending`, () => {
      setTimeout(() => {
        $scope.FlightData.get().then(data => {
          const { outgoing } = data
          $scope.sections[2].count = outgoing.filter(req => req.status == 'Pending').length
          $scope.$apply()
        })
      }, 500)
    })
  })

}])