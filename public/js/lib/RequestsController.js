'use strict';

app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  $scope.FlightData = FlightData;
  $scope.myRequests = [];

  $scope.FlightData.get().then(function (data) {
    var flightCode = data.flightCode,
        flightSeat = data.flightSeat,
        pending = data.pending;


    console.log('[requestCtrl] refreshed data');
    $scope.myRequests = pending;

    socket.on(flightCode + '/' + flightSeat + '-seatmap', function (data) {
      $scope.FlightData.get().then(function (data) {
        var pending = data.pending;

        $scope.myRequests = pending;

        console.log('myRequest: ');
        console.log($scope.myRequests);
      });
    });
  });
}]);