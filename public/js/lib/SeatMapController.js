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

    $(document).on('click', '.seat > label', function (event) {
      var seatId = event.target.parentNode.id;

      // if pending, show accept modal
      if ($(event.target).is('.seat.me > label')) {} else if ($(event.target).is('.seat.taken.option > label')) {
        showAcceptModal(seatId);
      } else {

        showConfirmModal(seatId);
        $(document).off('click', '#confirm-swap');
        $(document).on('click', '#confirm-swap', function () {
          confirmSwap(seatId);
        });

        $('#companion1').click(function () {
          showFirstCompanion();return false;
        });
        $('#companion2').click(function () {
          showSecondCompanion();return false;
        });
      }
    });

    $('#aisle-button').click(function () {
      showAisleModal();return false;
    });
    $('#window-button').click(function () {
      showWindowModal();return false;
    });
    $('.logout-icon').click(function () {
      showLogoutModal();return false;
    });

    function showAcceptModal(seat) {
      $('#accept-details').remove();
      $('#modal-accept').modal('show');
      $('#modal-body-accept').prepend('\n        <span id="accept-details">Accept incoming seat swap from ' + seat + '?</span)\n        ');
    }
    function showConfirmModal(seat) {
      $("#details").remove();
      $("#confirm-swap-modal").modal('show');
      $("#confirm-body").prepend('\n        <span id="details">Complete the following form to make a request for swapping from ' + ownSeat + ' to ' + seat + '.\n        <div class="vs4"></div>\n        <div class="form-group">\n                    <label for="message">Message</label>\n                    <input type="text" class="form-control" placeholder="Enter a message">\n                </div>\n                <div class="vs4"></div>\n                <a id="companion1" href="#">Click here to add a companion.</a>\n                <div class="vs4"></div>\n                <a id="companion2" href="#"></a>\n            </div>\n        </span>\n      ');
    }

    function showAisleModal() {
      console.log("testing");
      $("#modal-body-aisle").empty();
      $("#modal-aisle").modal('show');
      $("#modal-body-aisle").prepend('<span>Are you sure you want to request for an <b>aisle seat</b>? You will be allocated to the frontmost aisle seat if they are available.</span>');
    }

    function showWindowModal() {
      $("#modal-body-window").empty();
      $("#modal-window").modal('show');
      $("#modal-body-window").prepend('<span>Are you sure you want to request for a <b>window seat</b>? You will be allocated to the frontmost window seat if they are available.</span>');
    }

    function showLogoutModal() {
      $("#modal-body-logout").empty();
      $("#logoutModal").modal('show');
      $("#modal-body-logout").prepend('<span>Are you sure you want to logout?</span>');
    }

    function showFirstCompanion() {
      $("#companion1").empty();
      $("#companion1").removeAttr("href");
      $("#companion1").prepend('<span>10B</span>');
      $("#companion1").off();
      $("#companion2").prepend('<span>Click here to add a companion.</span>');
    }

    function showSecondCompanion() {
      $("#companion2").empty();
      $("#companion2").removeAttr("href");
      $("#companion2").prepend('<span>9B</span>');
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
      console.log('Data from -init: requests people have sent you');
      console.log(data);
    });

    socket.on(flightCode + '/' + flightSeat + '-seatmap', function (data) {
      var available = data.available,
          pending = data.pending;

      console.log('Data from -seatmap: pending request updates, need to re-render ');
      console.log(data);

      $scope.FlightData.updatePending(pending);
    });
  });
}]);