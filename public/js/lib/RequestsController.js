'use strict';

app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('RequestsController loaded!');
  $scope.FlightData = FlightData;
  $scope.myRequests = [];

  $scope.resetSockets = function () {
    var active = true;
    $scope.FlightData.get().then(function (data) {
      var flightCode = data.flightCode,
          flightSeat = data.flightSeat,
          outgoing = data.outgoing;

      $scope.myRequests = outgoing;

      socket.on(flightCode + '/' + flightSeat + '-pending', function (request) {
        if (!active) return;
        $scope.FlightData.get().then(function (data) {
          $scope.myRequests = data.outgoing;
        });
      });

      socket.on(flightCode + '/' + flightSeat + '-accepted', function (updatedRequest) {
        if (!active) return;

        // Reset seat map
        if (updatedRequest.isSingle) {
          $scope.FlightData.resetToNewSeat(updatedRequest.toSeat);
        }

        active = false;
        $scope.resetSockets();
      });

      socket.on(flightCode + '/' + flightSeat + '-reset', function (newSeat) {
        if (!active) return;
        setTimeout(function () {
          active = false;
          $scope.resetSockets();
        }, 500);
      });

      socket.on(flightCode + '/' + flightSeat + '-declined', function (updatedRequest) {
        if (!active) return;

        // Change status
        $scope.FlightData.receivedDecline(updatedRequest);
        $scope.FlightData.get().then(function (data) {
          $scope.myRequests = data.outgoing;
        });
      });
    });
  };

  $scope.resetSockets();
}]);