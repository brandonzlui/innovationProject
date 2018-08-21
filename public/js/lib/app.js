'use strict';

var app = angular.module('seatCX', ['ui.router']);

// Setup flight data
app.factory('FlightData', function ($q) {
  var flightCode = localStorage.getItem('flightCode');
  var flightSeat = localStorage.getItem('flightSeat');

  // Join channels
  socket.emit('create', {
    flightCode: flightCode,
    flightSeat: flightSeat
  });

  // Setup FlightData
  var data = null;
  return {
    get: function get() {
      var deferred = $q.defer();

      // TODO have backend also return my pendings
      if (data) {
        deferred.resolve(data);
      } else {
        $.ajax({
          url: './api/seatMap/' + flightCode,
          method: 'GET',
          success: function success(planeData) {
            data = {
              flightCode: flightCode,
              flightSeat: flightSeat,
              plane: planeData,
              outgoing: [],
              incoming: [],
              pending: []
            };

            deferred.resolve(data);
          },
          error: function error(_error) {
            deferred.reject(_error);
          }
        });
      }

      return deferred.promise;
    },

    addIncomingRequest: function addIncomingRequest(request) {
      data.incoming.push(request);
    },

    addOutgoingRequest: function addOutgoingRequest(request) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.outgoing[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entry = _step.value;

          if (entry.created == request.created && entry.toSeat == request.toSeat) return;
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

      data.outgoing.push(request);
    },

    updatePending: function updatePending(pending) {
      data.pending = pending;
    },

    replaceIncomingRequests: function replaceIncomingRequests(incoming) {
      data.incoming = incoming;
    }
  };
});

// Components
app.component('seatmap', {
  templateUrl: 'views/seatmap.html',
  controller: 'SeatMapController'
});

app.component('postings', {
  templateUrl: 'views/postings.html',
  controller: 'PostingsController'
});

app.component('requests', {
  templateUrl: 'views/requests.html',
  controller: 'RequestsController'
});

// States
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  var components = ['seatmap', 'postings', 'requests'];
  components.forEach(function (component) {
    $stateProvider.state({
      name: component,
      url: '/',
      component: component
    });
  });

  $urlRouterProvider.otherwise('/');
}]);