app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  console.log('PostingController loaded!')
  $scope.FlightData = FlightData

  $scope.FlightData.get().then(flightData => {
    console.log(flightData.incoming)
    $scope.requests = flightData.incoming
  })
}])