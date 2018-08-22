'use strict';

app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('PostingController loaded!');
  $scope.FlightData = FlightData;

  $scope.$on('ngRepeatFinished', function () {
    updateButtonListeners();
  });

  $scope.resetSockets = function () {
    $scope.FlightData.get().then(function (flightData) {
      var flightCode = flightData.flightCode,
          flightSeat = flightData.flightSeat,
          incoming = flightData.incoming;

      $scope.requests = incoming;
      updateButtonListeners();

      socket.on(flightCode + '/' + flightSeat + '-request', function (request) {
        $scope.FlightData.addIncomingRequest(request);
        $('#newRequestSpan').html(request.fromSeat);
        $('#newRequestModal').modal('show');
        $scope.FlightData.get().then(function (data) {
          $scope.requests = data.incoming;
          updateButtonListeners();
        });
      });

      socket.on(flightCode + '/' + flightSeat + '-pending', function (request) {
        $scope.FlightData.addOutgoingRequest(request);
      });

      socket.on(flightCode + '/' + flightSeat + '-reset', function (newSeat) {
        $scope.FlightData.resetToNewSeat(newSeat);
        $scope.resetSockets();
      });
    });
  };

  $scope.resetSockets();

  function updateButtonListeners() {
    // Remove previous event listeners
    $(document).off('click', '.acceptBtn');
    $(document).off('click', '.declineBtn');

    var acceptButtons = document.getElementsByClassName('acceptBtn');
    for (var i = 0; i < acceptButtons.length; ++i) {
      acceptButtons[i].addEventListener('click', function (event) {
        var id = event.target.id;
        var request = JSON.parse(id.substring(0, id.length - 2));
        $('#respondModal-' + request.fromSeat + '-' + request.toSeat).modal('hide');

        setTimeout(function () {
          socket.emit('accept', request);
          $scope.resetSockets();
        }, 500);
      });
    }
  }
}]);