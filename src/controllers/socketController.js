const DataSource = require('../models/DataSource')
const cxData = DataSource.getInstance()
const SwapRequest = require('../models/SwapRequest')

module.exports = function(io) {
  io.on('connection', socket => {
    console.log(`${socket.id} connected`)
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
    })
  
    socket.on('create', data => {
      const { flightCode, flightSeat } = data

      console.log('Rooms: ' + socket.rooms)
      for (let room in socket.rooms) {
        console.log(room + '-' + socket.rooms[room])
      } 

      // Join flight channel
      socket.join(flightCode)

      // Join seat channel and init channel
      socket.join(`${flightCode}/${flightSeat}`)
      socket.join(`${flightCode}/${flightSeat}-init`)
      socket.join(`${flightCode}/${flightSeat}-seatmap`)

      // Get plane data
      const [_, seatMap] = cxData.getSeatMap(flightCode)
      const col = flightSeat.slice(-1)
      if (seatMap.aisle.includes(col)) socket.join(`${flightCode}/aisle`)
      if (seatMap.window.includes(col)) socket.join(`${flightCode}/window`)
  
      console.log(`Creating data ${JSON.stringify(data)}`)

      // Send previous requests
      const requests = cxData.getRequests(seatMap, flightSeat)
      const serialisedRequests = JSON.stringify(requests.map(req => req.toJSON()))
      io.emit(`${flightCode}/${flightSeat}-init`, serialisedRequests)
    })

    socket.on('single-request', data => {
      // Parse request
      const { flightCode, fromSeat, toSeat, companions, message} = data

      // Build request object
      const request = new SwapRequest(flightCode, fromSeat, companions, message)
      request.setSingleSwap(toSeat)

      // Add request to backend
      cxData.addRequest(request)

      const [_, seatMap] = cxData.getSeatMap(flightCode)
      const seatData = {
        available: seatMap.available,
        pending: cxData.getPendingRequests(flightCode, fromSeat)
      }

      // Emit to relevant channel
      io.emit(`${flightCode}/${toSeat}`, request.toJSON())
      io.emit(`${flightCode}/${fromSeat}-seatmap`, seatData)
    })

    socket.on('multi-request', data => {
      // Parse request
      const { flightCode, fromSeat, category, companions, message} = data

      // Build request object
      const request = new SwapRequest(flightCode, fromSeat, companions, message)
      request.setMultiSwap(category)

      // Add request to backend
      cxData.addRequest(request)

      // Emit to channels
      io.emit(`${flightCode}/${category}`, request.toJSON())
    })
  
    socket.on('request', data => {
      // Parse request
      const { flightCode, fromSeat, toSeat, companions, message } = data

      // Build request object
      const toSeats = Array.isArray(toSeat) ? toSeat : [toSeat]

      // Add request to backend
      const request = new SwapRequest(flightCode, fromSeat, toSeats, companions, message)
      cxData.addRequest(request)

      //
  
      // build message to other guy
      console.log(`Emitting to channel ${flightCode}/${toSeat}`)
      io.emit(`${flightCode}/${toSeat}`, data)
    })

    socket.on('accept', data => {
      /**
       * 1. find & update request 
       * 2. backend update source of truth through DataSource
       * 3. publish same request to channels (frontend handle rendering)
       */
    })

    socket.on('decline', data => {
      /**
       * 1. find & update request 
       * 2. backend update source of truth through DataSource
       * 3. publish same request to channels (frontend handle rendering)
       */
    })

    socket.on('cancel', data => {
      // TODO
    })
  })
}