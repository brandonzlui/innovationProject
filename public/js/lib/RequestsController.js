'use strict';

app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('RequestsController loaded!');
  $scope.FlightData = FlightData;
  $scope.myRequests = [];

  $scope.resetSockets = function () {
    $scope.FlightData.get().then(function (data) {
      var flightCode = data.flightCode,
          flightSeat = data.flightSeat,
          outgoing = data.outgoing;

      $scope.myRequests = outgoing;

      // socket.on(`${flightCode}/${flightSeat}-request`, request => {
      //   console.log(request.fromSeat)
      //   $('#newRequestSpan').html(request.fromSeat)
      //   $('#newRequestModal').modal('show')
      // })

      socket.on(flightCode + '/' + flightSeat + '-pending', function (request) {
        $scope.FlightData.get().then(function (data) {
          $scope.myRequests = data.outgoing;
        });
      });

      socket.on(flightCode + '/' + flightSeat + '-accepted', function (updatedRequest) {
        // Reset seat map
        if (updatedRequest.isSingle) {
          $scope.FlightData.resetToNewSeat(updatedRequest.toSeat);
        }

        $scope.resetSockets();
      });

      socket.on(flightCode + '/' + flightSeat + '-reset', function (newSeat) {
        setTimeout(function () {
          return $scope.resetSockets();
        }, 500);
      });

      socket.on(flightCode + '/' + flightSeat + '-declined', function (updatedRequest) {
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