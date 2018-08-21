'use strict';

app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('PostingController loaded!');
  $scope.FlightData = FlightData;

  $scope.FlightData.get().then(function (flightData) {
    console.log(flightData.incoming);
    $scope.requests = flightData.incoming;
  });
}]);