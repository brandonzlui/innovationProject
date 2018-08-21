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

      socket.join(flightCode)    // use for new seat map purposes
      socket.join(`${flightCode}/${flightSeat}-init`)                         // use for REPLACE postings
      console.log(`${socket.id} joined init`)

      socket.join(`${flightCode}/${flightSeat}-request`)                      // use for NEW postings
      const [_, seatMap] = cxData.getSeatMap(flightCode)
      const col = flightSeat.slice(-1)
      if (seatMap.aisle.includes(col)) socket.join(`${flightCode}/aisle`)     // use for NEW postings
      if (seatMap.window.includes(col)) socket.join(`${flightCode}/window`)   // use for NEW postings

      socket.join(`${flightCode}/${flightSeat}-pending`)                      // use for NEW pending
      socket.join(`${flightCode}/${flightSeat}-accepted`)                     // use for NEW accepted
      socket.join(`${flightCode}/${flightSeat}-declined`)                     // use for NEW declined
    })

    socket.on('fetch', data => {
      const { flightCode, flightSeat } = data
      const [_, seatMap] = cxData.getSeatMap(flightCode)

      // Send previous requests
      const requests = cxData.getRequests(seatMap, flightSeat).map(req => req.toJSON())
      console.log(requests)
      io.emit(`${flightCode}/${flightSeat}-init`, requests)
    })

    socket.on('single-request', data => {
      // Parse request
      const { flightCode, fromSeat, toSeat, companions, message} = data

      // Build request object
      const request = new SwapRequest(flightCode, fromSeat, companions, message)
      request.setSingleSwap(toSeat)

      // Add request to backend
      cxData.addRequest(request)

      // Emit new posting
      io.emit(`${flightCode}/${toSeat}-request`, request.toJSON())

      // Emit new pending
      io.emit(`${flightCode}/${fromSeat}-pending`, request.toJSON())
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