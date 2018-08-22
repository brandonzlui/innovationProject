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

  $scope.curr = 'seatmap'

  $scope.changeState = function(stateName) {
    $scope.curr = stateName
    $state.go(stateName)
  }

  $scope.FlightData = FlightData

  $scope.FlightData.get().then(data => {
    const { flightSeat, flightCode, outgoing } = data
    $scope.sections[2].count = outgoing.length

    socket.on(`${flightCode}/${flightSeat}-pending`, () => {
      setTimeout(() => {
        $scope.FlightData.get().then(data => {
          const { outgoing } = data
          $scope.sections[2].count = outgoing.filter(req => req.status == 'Pending').length
        })
      }, 500)
    })

    socket.on(`${flightCode}/${flightSeat}-request`, request => {
      setTimeout(() => {
        $scope.FlightData.get().then(data => {
          const { incoming } = data
          $scope.sections[1].count = incoming.length
        })
      }, 500)
    })

    socket.on(`${flightCode}/${flightSeat}-init`, postings => {
      setTimeout(() => {
        $scope.FlightData.get().then(data => {
          const { incoming } = data
          $scope.sections[1].count = incoming.length
        })
      }, 500)
    })

    socket.on(`${flightCode}/${flightSeat}-reset`, newSeat => {
      setTimeout(() => {
        $scope.FlightData.get().then(data => {
          const { incoming, outgoing } = data
          $scope.sections[1].count = incoming.length
          $scope.sections[2].count = outgoing.length
        })
      }, 500)
    })
  })

}])