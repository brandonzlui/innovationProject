'use strict';

app.controller('SeatMapController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  $scope.FlightData = FlightData;

  function setUpSeatMap(plane, incoming, ownSeat) {
    var candidates = new Set(incoming.map(function (request) {
      return request.fromSeat;
    }));
    var letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    // Update cockpit
    var flightCode = localStorage.getItem('flightCode');
    document.getElementById('flightCode').innerHTML = flightCode;
    document.getElementById('mySeat').innerHTML = 'My seat: ' + ownSeat;

    // Render seat map
    var cabin = document.getElementById('cabin');
    var html = "";

    for (var i = 0; i < plane.rows; ++i) {
      var rowNumber = String(i + 1);

      html += '<li class="row row--' + rowNumber + '">';
      html += '<ol class="seats" type="A">';
      for (var j = 0; j < plane.seatsPerRow; ++j) {
        var seat = rowNumber + letters[j];
        var available = plane.available.includes(seat);

        var classList = ['seat'];
        classList.push(available ? 'free' : 'taken');
        if (candidates.has(seat)) classList.push('option');
        if (ownSeat == seat) classList.push('me');

        html += '\n          <li class="seat ' + classList.join(' ') + '" id="' + seat + '">\n            <input type="checkbox" />\n            <label for="' + seat + '">' + seat + '</label>\n          </li>\n        ';
      }

      html += '</ol>';
      html += '</li>';
    }

    cabin.innerHTML = html;

    // Reset listeners
    $(document).off('click', '.seat > label');

    // Cannot press on my own seat
    $('#' + ownSeat + ' > input').prop('disabled', true);

    // Click listener for AVAILABLE seat
    $(document).on('click', '.seat.free > label', function (event) {
      return console.log('Clicked on free seat ' + event.target.parentNode.id);
    });

    $(".modal").on("hidden.bs.modal", function () {
      $(".modal-body").html("");
    });

    $(document).on('click', '.seat > label', function (e) {
      showModal(e.target.parentNode.id);
      $(document).on('click', '#confirm-swap', function () {
        confirmSwap(e.target.parentNode.id);
      });
      $('#companion1').click(function () {
        showFirstCompanion();return false;
      });
      $('#companion2').click(function () {
        showSecondCompanion();return false;
      });
    });

    function showModal(seat) {
      $("#details").remove();
      $("#confirm-swap-modal").modal('show');
      $("#confirm-body").prepend('\n        <span id="details">Complete the following form to make a request for swapping from ' + ownSeat + ' to ' + seat + '.\n        <div class="vs4"></div>\n        <div class="form-group">\n                    <label for="message">Message</label>\n                    <input type="text" class="form-control" placeholder="Enter a message">\n                </div>\n                <div class="vs4"></div>\n                <a id="companion1" href="#">Click here to add a companion.</a>\n                <div class="vs4"></div>\n                <a id="companion2" href="#"></a>\n            </div>\n        </span>\n      ');
    }

    function showFirstCompanion() {
      $("#companion1").empty();
      $("#companion1").removeAttr("href");
      $("#companion1").prepend('<span>10B CHAN TAI MING</span>');
      $("#companion2").prepend('<span>Click here to add a companion.</span>');
    }

    function showSecondCompanion() {
      $("#companion2").empty();
      $("#companion2").removeAttr("href");
      $("#companion2").prepend('<span>9B TANG CHUN MING</span>');
    }

    function confirmSwap(seat) {
      $('#confirm-swap-modal').modal('hide');
      console.log('Want to take seat ' + seat);

      var request = {
        flightCode: flightCode,
        fromSeat: ownSeat,
        toSeat: seat,
        companions: [],
        message: 'Please swap'
      };

      $scope.FlightData.addOutgoingRequest(request);
      socket.emit('single-request', request);
    }
  }

  $scope.FlightData.get().then(function (factory) {
    var flightCode = factory.flightCode,
        flightSeat = factory.flightSeat,
        plane = factory.plane,
        outgoing = factory.outgoing,
        incoming = factory.incoming;

    // Setup seat map

    setUpSeatMap(plane, incoming, flightSeat);

    socket.on(flightCode + '/' + flightSeat, function (data) {
      var flightCode = data.flightCode,
          fromSeat = data.fromSeat,
          toSeat = data.toSeat,
          isSingle = data.isSingle,
          message = data.message;


      var type = isSingle ? 'one-to-one' : 'one-to-many';
      console.log('Received ' + type + ' message from person at ' + fromSeat + ': ' + message);

      $scope.FlightData.addIncomingRequest(data);

      $scope.FlightData.get().then(function (factory) {
        var flightCode = factory.flightCode,
            flightSeat = factory.flightSeat,
            plane = factory.plane,
            outgoing = factory.outgoing,
            incoming = factory.incoming;

        setUpSeatMap(plane, incoming, flightSeat);
      });
    });

    socket.on(flightCode + '/' + flightSeat + '-init', function (data) {
      console.log(data);
    });
  });
}]);