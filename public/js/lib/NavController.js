'use strict';

app.controller('NavController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('NavController loaded!');
  $scope.sections = [{
    title: 'Seat Map',
    stateName: 'seatmap',
    hasBadge: false
  }, {
    title: 'Postings',
    stateName: 'postings',
    hasBadge: true,
    count: 0
  }, {
    title: 'My Requests',
    stateName: 'requests',
    hasBadge: true,
    count: 0
  }];

  $scope.changeState = function (stateName) {
    $state.go(stateName);
  };

  $scope.FlightData = FlightData;

  $scope.FlightData.get().then(function (data) {
    var flightSeat = data.flightSeat,
        flightCode = data.flightCode,
        pending = data.pending;

    $scope.sections[2].count = pending.length;

    socket.on(flightCode + '/' + flightSeat + '-pending', function () {
      setTimeout(function () {
        $scope.FlightData.get().then(function (data) {
          var outgoing = data.outgoing;

          $scope.sections[2].count = outgoing.filter(function (req) {
            return req.status == 'Pending';
          }).length;
          $scope.$apply();
        });
      }, 500);
    });
  });
}]);