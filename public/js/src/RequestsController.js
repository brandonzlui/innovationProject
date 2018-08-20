app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  $scope.FlightData = FlightData

  $scope.FlightData.get().then(flightData => {
    console.log(flightData.incoming)
    $scope.requests = flightData.incoming
  })
}])