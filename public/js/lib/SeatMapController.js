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

    // Click listener for TAKEN seat
    $(document).on('click', '.seat.taken > label', function (event) {
      console.log('Want to take seat ' + event.target.parentNode.id);

      var request = {
        flightCode: flightCode,
        fromSeat: ownSeat,
        toSeat: event.target.parentNode.id,
        companions: [],
        message: 'Please swap'
      };

      $scope.FlightData.addOutgoingRequest(request);
      socket.emit('single-request', request);
    });
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
  });
}]);

/**
 * $(document).ready(() => {
  $.ajax({
    url: `./api/seatMap/${localStorage.getItem('flightCode')}`,
    method: 'GET',
    async: true,
    success: seatMapSuccess,
    error: seatMapError
  })
})

function seatMapSuccess(plane, status, jqXHR) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  // Update cockpit
  document.getElementById('flightCode').innerHTML = localStorage.getItem('flightCode')
  document.getElementById('planeName').innerHTML = plane.name

  // Render seat map
  const cabin = document.getElementById('cabin')
  const ownSeat = localStorage.getItem('flightSeat')
  let html = ""

  for (let i = 0; i < plane.rows; ++i) {
    const rowNumber = String(i + 1)

    html += `<li class="row row--${rowNumber}">`
    html += `<ol class="seats" type="A">`
    for (let j = 0; j < plane.seatsPerRow; ++j) {
      const seat = rowNumber + letters[j]
      const available = plane.available.includes(seat)

      html += `
        <li class="seat ${available ? 'free' : ''} ${ownSeat == seat ? 'me' : ''}" id="${seat}">
          <input type="checkbox" />
          <label for="${seat}">${seat}</label>
        </li>
      `
    }

    html += `</ol>`
    html += `</li>`
  }

  cabin.innerHTML = html
  refreshSeats()
}
 */