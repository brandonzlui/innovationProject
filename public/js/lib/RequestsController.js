'use strict';

app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  $scope.FlightData = FlightData;

  $scope.FlightData.get().then(function (flightData) {
    console.log(flightData.incoming);
    $scope.requests = flightData.incoming;
  });
}]);