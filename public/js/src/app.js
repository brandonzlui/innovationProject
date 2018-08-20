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

      if (data) {
        deferred.resolve(data)
      } else {
        $.ajax({
          url: `./api/seatMap/${flightCode}`,
          method: 'GET',
          success: planeData => {
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
      data.incoming.push(request)
    },

    addOutgoingRequest: function(request) {
      data.outgoing.push(request)
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