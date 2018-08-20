'use strict';

app.controller('NavController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('Nav sections: ' + $scope.sections);
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

    if (!$scope.$$phase) $scope.$apply();

    socket.on(flightCode + '/' + flightSeat + '-seatmap', function (data) {
      var pending = data.pending;

      $scope.sections[2].count = pending.length;
      $scope.$apply();
    });
  });
}]);