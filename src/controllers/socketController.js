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
      console.log(`${socket.id} joined init for ${flightSeat}`)

      socket.join(`${flightCode}/${flightSeat}-request`)                      // use for NEW postings
      const [_, seatMap] = cxData.getSeatMap(flightCode)
      const col = flightSeat.slice(-1)
      if (seatMap.aisle.includes(col)) socket.join(`${flightCode}/aisle`)     // use for NEW postings
      if (seatMap.window.includes(col)) socket.join(`${flightCode}/window`)   // use for NEW postings

      socket.join(`${flightCode}/${flightSeat}-pending`)                      // use for NEW pending
      socket.join(`${flightCode}/${flightSeat}-accepted`)                     // use for NEW accepted
      socket.join(`${flightCode}/${flightSeat}-declined`)                     // use for NEW declined
      socket.join(`${flightCode}/${flightSeat}-reset`)
      socket.join(`${flightCode}/${flightSeat}-cancelled`)

      console.log(Object.keys(socket.rooms))
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
      // Parse request
      const { created, flightCode, fromSeat, toSeat, isSingle, companions, message } = data
      console.log(`${toSeat} accepted request from ${fromSeat} created on ${created}`)

      const request = new SwapRequest(flightCode, fromSeat, companions, message)
      if (isSingle) request.setSingleSwap(toSeat)
      // else TODO

      const updatedRequest = cxData.acceptRequest(request, created)
      if (!updatedRequest) {
        // console.error('cannot find!!!')
        return
      }

      const [_, seatMap] = cxData.getSeatMap(flightCode)

      // Tell creator that it has been accepted
      io.emit(`${flightCode}/${fromSeat}-accepted`, updatedRequest)

      // Tell whoever accepted to reset their map
      io.emit(`${flightCode}/${toSeat}-reset`, fromSeat)
      unsubscribe(socket, flightCode, toSeat, seatMap)
    })

    socket.on('unsubscribe', data => {
      const { flightCode, flightSeat } = data
      const [_, seatMap] = cxData.getSeatMap(flightCode)
      unsubscribe(socket, flightCode, flightSeat, seatMap)
    })

    socket.on('decline', data => {
      /**
       * 1. find & update request 
       * 2. backend update source of truth through DataSource
       * 3. publish same request to channels (frontend handle rendering)
       */

      // Parse request
      const { created, flightCode, fromSeat, toSeat, isSingle, companions, message } = data
      console.log(`${toSeat} declined request from ${fromSeat} created on ${created}`)

      const request = new SwapRequest(flightCode, fromSeat, companions, message)
      if (isSingle) request.setSingleSwap(toSeat)
      // else TODO

      const updatedRequest = cxData.declineRequest(request, created)
      if (!updatedRequest) {
        // console.error('cannot find!!!')
        return
      }

      // Tell creator that it has been accepted
      io.emit(`${flightCode}/${fromSeat}-declined`, updatedRequest)
    })

    socket.on('free', data => {
      const { flightCode, oldSeat, newSeat } = data

      // Changes to OLCI
      cxData.takeSeat(flightCode, newSeat)
      cxData.releaseSeat(flightCode, oldSeat)
      const [_, seatMap] = cxData.getSeatMap(flightCode)

      console.log(`Sending reset to ${oldSeat}`)
      io.emit(`${flightCode}/${oldSeat}-reset`, newSeat)
      io.emit(flightCode, seatMap.available)

      unsubscribe(socket, flightCode, oldSeat, seatMap)
    })

    socket.on('cancel', data => {
      const { created, flightCode, fromSeat, toSeat, isSingle, companions, message } = data
      const request = new SwapRequest(flightCode, fromSeat, companions, message)
      if (isSingle) request.setSingleSwap(toSeat)

      // Data source update
      const updatedRequest = cxData.cancelRequest(request, created)

      // Tell toSeat that request has been cancelled
      io.emit(`${flightCode}/${toSeat}-cancelled`, updatedRequest)
    })
  })
}

function unsubscribePromise(socket, flightCode, flightSeat, seatMap) {
  return new Promise((resolve, reject) => {
    socket.leave(`${flightCode}/${flightSeat}-init`, err => {
      if (err) return reject(err)

      socket.leave(`${flightCode}/${flightSeat}-pending`, err => {
        if (err) return reject(err)

        socket.leave(`${flightCode}/${flightSeat}-accepted`, err => {
          if (err) return reject(err)

          socket.leave(`${flightCode}/${flightSeat}-declined`, err => {
            if (err) return reject(err)

            socket.leave(`${flightCode}/${flightSeat}-reset`, err => {
              if (err) return reject(err)

              socket.leave(`${flightCode}/${flightSeat}-cancelled`, err => {
                if (err) return reject(err)

                socket.leave(`${flightCode}/${flightSeat}-request`, err => {
                  if (err) return reject(err)

                  const col = flightSeat.slice(-1)
                  if (seatMap.aisle.includes(col)) socket.leave(`${flightCode}/aisle`)
                  if (seatMap.window.includes(col)) socket.leave(`${flightCode}/window`)
                  resolve(true)
                })
              })
            })
          })
        })
      })
    })
  })
}

function unsubscribe(socket, flightCode, flightSeat, seatMap) {
  console.log(socket.id + ' before')
  console.log(Object.keys(socket.rooms))
  unsubscribePromise(socket, flightCode, flightSeat, seatMap).then(_ => {
    console.log(socket.id + ' after')
    console.log(Object.keys(socket.rooms))
  }).catch(err => console.error(err)) 
}