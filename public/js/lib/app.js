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
              incoming: []
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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.incoming[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entry = _step.value;

          if (entry.created == request.created && entry.fromSeat == request.fromSeat) reutrn;
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

      data.incoming.push(request);
    },

    addOutgoingRequest: function addOutgoingRequest(request) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.outgoing[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var entry = _step2.value;

          if (entry.created == request.created && entry.toSeat == request.toSeat) return;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
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
    },

    resetToNewSeat: function resetToNewSeat(newSeat) {
      data.flightSeat = newSeat;
      data.outgoing = [];
      data.incoming = [];
    },

    setAvailable: function setAvailable(available) {
      data.plane.available = available;
    },

    findIncomingRequest: function findIncomingRequest(fromSeat) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data.incoming[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var request = _step3.value;

          if (request.fromSeat == fromSeat) return request;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return null;
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

// ng-repeat-finished directive
app.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          return scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
});

/**
 * 
 */