const app = angular.module('seatCX', ['ui.router'])

// Setup flight data
app.factory('FlightData', ($q) => {
  const flightCode = localStorage.getItem('flightCode')
  const flightSeat = localStorage.getItem('flightSeat')

  // Join channels
  socket.emit('create', {
    flightCode: flightCode,
    flightSeat: flightSeat
  })

  // Setup FlightData
  let data = null
  return {
    get: function() {
      const deferred = $q.defer()

      // TODO have backend also return my pendings
      if (data) {
        deferred.resolve(data)
      } else {
        $.ajax({
          url: `./api/seatMap/${flightCode}`,
          method: 'GET',
          success: planeData => {
            planeData.available = planeData.available.sort((x, y) => x.substring(0, x.length - 1) - y.substring(0, y.length - 1))
            data = {
              flightCode: flightCode,
              flightSeat: flightSeat,
              plane: planeData,
              outgoing: [],
              incoming: []
            }

            deferred.resolve(data)
          },
          error: error => {
            deferred.reject(error)
          }
        })
      }

      return deferred.promise
    },

    addIncomingRequest: function(request) {
      for (let entry of data.incoming) {
        if (entry.created == request.created && entry.fromSeat == request.fromSeat) reutrn
      }
      data.incoming.push(request)
    },

    addOutgoingRequest: function(request) {
      for (let entry of data.outgoing) {
        if (entry.created == request.created && entry.toSeat == request.toSeat) return
      }

      data.outgoing.push(request)
    },

    updatePending: function(pending) {
      data.pending = pending
    },

    replaceIncomingRequests: function(incoming) {
      data.incoming = incoming
    },

    resetToNewSeat: function(newSeat) {
      localStorage.setItem('flightSeat', newSeat)
      data.flightSeat = newSeat
      data.outgoing = []
      data.incoming = []
    },

    setAvailable: function(available) {
      data.plane.available = available.sort((x, y) => x.substring(0, x.length - 1) - y.substring(0, y.length - 1))
    },

    findIncomingRequest: function(fromSeat) {
      for (let request of data.incoming) { 
        if (request.fromSeat == fromSeat) return request
      }
      return null
    },

    receivedDecline: function(updatedRequest) {
      data.outgoing = data.outgoing.filter(req => req.toSeat != updatedRequest.toSeat)
    },

    sendDecline: function(fromSeat) {
      data.incoming = data.incoming.filter(req => req.fromSeat != fromSeat)
    },

    receivedCancel: function(fromSeat) {
      data.incoming = data.incoming.filter(req => req.fromSeat != fromSeat)
    }
  }
})

// Components
app.component('seatmap', {
  templateUrl: `views/seatmap.html`,
  controller: 'SeatMapController'
})

app.component('postings', {
  templateUrl: `views/postings.html`,
  controller: 'PostingsController'
})

app.component('requests', {
  templateUrl: `views/requests.html`,
  controller: 'RequestsController'
})

// States
app.config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {

  const components = ['seatmap', 'postings', 'requests']
  components.forEach(component => {
    $stateProvider.state({
      name: component,
      url: '/',
      component: component
    })
  })

  $urlRouterProvider.otherwise('/')
}])

// ng-repeat-finished directive
app.directive('onFinishRender', ($timeout) => {
	return {
		restrict: 'A',
		link: (scope, element, attr) => {
			if (scope.$last === true) {
				$timeout(() => scope.$emit('ngRepeatFinished'))
			}
		}
	}
})