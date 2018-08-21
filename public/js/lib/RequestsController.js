'use strict';

app.controller('RequestsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('RequestsController loaded!');
  $scope.FlightData = FlightData;
  $scope.myRequests = [];

  $scope.FlightData.get().then(function (data) {
    var flightCode = data.flightCode,
        flightSeat = data.flightSeat,
        outgoing = data.outgoing;


    console.log('[requestCtrl] refreshed data');
    $scope.myRequests = outgoing;

    // socket.on(`${flightCode}/${flightSeat}-pending`, pending => {
    //   // Add pending
    //   console.log(`ADDING request ${pending.created}`)
    //   $scope.FlightData.addOutgoingRequest(pending)
    //   $scope.myRequests = [pending].concat($scope.myRequests)
    // })
  });
}]);