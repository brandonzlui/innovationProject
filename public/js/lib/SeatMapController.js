'use strict';

/**
 * LEGEND:
 * .free := seat available
 * .taken := seat not available
 * .option := seat up for swap (that person is asking you)
 * .me := your seat
 */

app.controller('SeatMapController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  console.log('SeatMapController loaded!');
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

        html += '\n          <li class="' + classList.join(' ') + '" id="' + seat + '">\n            <input type="checkbox" />\n            <label for="' + seat + '">' + seat + '</label>\n          </li>\n        ';
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
    $(document).off('click', '.seat.free > label');
    $(document).on('click', '.seat.free > label', function (event) {
      var seatId = event.target.parentNode.id;
      console.log('Clicked on free seat ' + event.target.parentNode.id);

      socket.emit('free', {
        flightCode: flightCode,
        oldSeat: ownSeat,
        newSeat: seatId
      });

      $scope.FlightData.resetToNewSeat(seatId);
    });

    $(".modal").on("hidden.bs.modal", function () {
      $(".modal-body").html("");
    });

    $(document).on('click', '.seat.option > label', function (event) {
      var toSeat = event.target.parentNode.id;

      // get incoming request from data source
      var request = $scope.FlightData.findIncomingRequest(toSeat);

      // show accept modal
      showAcceptModal(toSeat, request);
    });

    $(document).on('click', '.seat.taken > label', function (event) {
      var seatId = event.target.parentNode.id;

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
    });

    // $(document).on('click', '.seat > label', function(event) {
    //   const seatId = event.target.parentNode.id

    //   // if pending, show accept modal
    //   if ($(event.target).is('.seat.me > label')){}
    //   else if ($(event.target).is('.seat.option > label')) {
    //     showAcceptModal(seatId)
    //   } else {
    //     showConfirmModal(seatId)
    //     $(document).off('click', '#confirm-swap')
    //     $(document).on('click', '#confirm-swap', function() {
    //       confirmSwap(seatId)
    //     })
    //     $('#companion1').click(function() { showFirstCompanion(); return false;})
    //     $('#companion2').click(function() { showSecondCompanion(); return false;})
    //   }
    // });

    $('#aisle-button').click(function () {
      showAisleModal();return false;
    });
    $('#window-button').click(function () {
      showWindowModal();return false;
    });
    $('.logout-icon').click(function () {
      showLogoutModal();return false;
    });

    function showAcceptModal(seat, request) {
      $('#accept-details').remove();
      $('#modal-accept').modal('show');
      $('#modal-body-accept').prepend('\n        <span id="accept-details">Accept incoming seat swap from ' + seat + '?</span)\n        ');

      $(document).off('click', '#modalAccept');
      $(document).on('click', '#modalAccept', function (event) {
        console.log('emitting request');
        console.log(request);
        socket.emit('accept', request);

        $('#modal-accept').modal('hide');
      });
    }
    function showConfirmModal(seat) {
      $("#details").remove();
      $("#confirm-swap-modal").modal('show');
      $("#confirm-body").prepend('\n        <span id="details">Complete the following form to make a request for swapping from ' + ownSeat + ' to ' + seat + '.\n          <div class="vs4"></div>\n          <div class="form-group">\n            <label for="message">Message</label>\n            <input type="text" class="form-control" placeholder="Enter a message" id="swapMessage">\n          </div>\n          <div class="vs4"></div>\n          <a id="companion1" href="#">Click here to add a companion.</a>\n          <div class="vs4"></div>\n          <a id="companion2" href="#"></a>\n          </div>\n        </span>\n      ');
    }

    function showAisleModal() {
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
        message: $('#swapMessage').val()
      };

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

    // ---- Socket handlers ----- //
    socket.on(flightCode + '/' + flightSeat + '-pending', function (request) {
      $scope.FlightData.addOutgoingRequest(request);
    });

    socket.on(flightCode + '/' + flightSeat + '-request', function (request) {
      /**
       * 1. update data source
       * 2. seat map needs to reflect change
       */
      $scope.FlightData.addIncomingRequest(request);
      handleNewRequest(request);
    });

    socket.on(flightCode + '/aisle', function (request) {
      $scope.FlightData.addIncomingRequest(request);
      handleNewRequest(request);
    });

    socket.on(flightCode + '/window', function (request) {
      $scope.FlightData.addIncomingRequest(request);
      handleNewRequest(request);
    });

    // TODO
    socket.on(flightCode + '/' + flightSeat + '-accepted', function (request) {
      // Parse request
      var flightCode = request.flightCode,
          fromSeat = request.fromSeat,
          toSeat = request.toSeat,
          isSingle = request.isSingle,
          companions = request.companions,
          message = request.message;

      console.log('accepted change to new seat ' + toSeat);

      localStorage.setItem('flightSeat', toSeat);

      // Update data source
      $scope.FlightData.resetToNewSeat(toSeat);
      $scope.FlightData.get().then(function (factory) {
        var flightCode = factory.flightCode,
            flightSeat = factory.flightSeat,
            plane = factory.plane,
            outgoing = factory.outgoing,
            incoming = factory.incoming;

        setUpSeatMap(plane, incoming, flightSeat);
      });
    });

    // TODO
    socket.on(flightCode + '/' + flightSeat + '-declined', function (request) {});

    socket.on(flightCode, function (available) {
      console.log('got new seat map with new available set');
      console.log(available);
      $scope.FlightData.setAvailable(available);
      $scope.FlightData.get().then(function (factory) {
        var flightCode = factory.flightCode,
            flightSeat = factory.flightSeat,
            plane = factory.plane,
            outgoing = factory.outgoing,
            incoming = factory.incoming;

        setUpSeatMap(plane, incoming, flightSeat);
      });
    });

    socket.on(flightCode + '/' + flightSeat + '-init', function (postings) {
      $scope.FlightData.replaceIncomingRequests(postings);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = postings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var request = _step.value;
          handleNewRequest(request);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });

    socket.on(flightCode + '/' + flightSeat + '-reset', function (newSeat) {
      localStorage.setItem('flightSeat', newSeat);
      $scope.FlightData.resetToNewSeat(newSeat);

      $scope.FlightData.get().then(function (factory) {
        var flightCode = factory.flightCode,
            flightSeat = factory.flightSeat,
            plane = factory.plane,
            outgoing = factory.outgoing,
            incoming = factory.incoming;

        // Setup seat map

        setUpSeatMap(plane, incoming, flightSeat);
      });
    });

    socket.emit('fetch', { flightCode: flightCode, flightSeat: flightSeat });
  });

  function handleNewRequest(request) {
    var flightCode = request.flightCode,
        fromSeat = request.fromSeat,
        toSeat = request.toSeat,
        isSingle = request.isSingle,
        companions = request.companions,
        message = request.message;

    // Debugging console logs

    var type = isSingle ? 'one-to-one' : 'one-to-many';
    console.log('Received ' + type + ' message from person at ' + fromSeat + ': ' + message);

    // DOM update
    document.getElementById(fromSeat).className = 'seat option';
  }
}]);