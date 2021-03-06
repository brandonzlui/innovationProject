'use strict';

var TIMEOUT = 500;

app.controller('NavController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('NavController loaded!');
  $scope.curr = 'seatmap';
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
    $scope.curr = stateName;
    $state.go(stateName);
  };

  $scope.FlightData = FlightData;

  $scope.resetSockets = function () {
    var active = true;
    $scope.FlightData.get().then(function (data) {
      var flightSeat = data.flightSeat,
          flightCode = data.flightCode,
          outgoing = data.outgoing;

      $scope.sections[2].count = outgoing.length;

      socket.on(flightCode + '/' + flightSeat + '-pending', function () {
        if (!active) return;
        setTimeout(function () {
          $scope.FlightData.get().then(function (data) {
            var outgoing = data.outgoing;

            $scope.sections[2].count = outgoing.filter(function (req) {
              return req.status == 'Pending';
            }).length;
          });
        }, TIMEOUT);
      });

      socket.on(flightCode + '/' + flightSeat + '-request', function (request) {
        if (!active) return;
        setTimeout(function () {
          $scope.FlightData.get().then(function (data) {
            var incoming = data.incoming;

            $scope.sections[1].count = incoming.length;
          });
        }, TIMEOUT);
      });

      socket.on(flightCode + '/' + flightSeat + '-init', function (postings) {
        if (!active) return;
        setTimeout(function () {
          $scope.FlightData.get().then(function (data) {
            var incoming = data.incoming;

            $scope.sections[1].count = incoming.length;
          });
        }, TIMEOUT);
      });

      socket.on(flightCode + '/' + flightSeat + '-reset', function (newSeat) {
        if (!active) return;
        setTimeout(function () {
          $scope.FlightData.get().then(function (data) {
            var incoming = data.incoming,
                outgoing = data.outgoing;

            $scope.sections[1].count = incoming.length;
            $scope.sections[2].count = outgoing.length;
          });
        }, TIMEOUT);
      });

      socket.on(flightCode + '/' + flightSeat + '-accepted', function (seat) {
        if (!active) return;
        setTimeout(function () {
          $scope.FlightData.get().then(function (data) {
            var incoming = data.incoming,
                outgoing = data.outgoing;

            $scope.sections[1].count = incoming.length;
            $scope.sections[2].count = outgoing.length;
          });
        }, TIMEOUT);
      });

      socket.on(flightCode + '/' + flightSeat + '-cancelled', function (request) {
        if (!active) return;
        setTimeout(function () {
          $scope.FlightData.get().then(function (data) {
            $scope.sections[1].count = data.incoming.length;
          });
        }, TIMEOUT);
      });
    });
  };

  $scope.resetSockets();
}]);