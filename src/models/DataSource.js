const CXAdapter = require('../adapters/CXAdapter')

const SwapRequest = require('../models/SwapRequest')

class DataSource {
  // TODO implement (wrapper around Adapter)
  // TODO have Adapter implement some interface

  constructor() {
    this.adapter = new CXAdapter()

    /** @type {SwapRequest[]} */
    this.requests = []
  }

  getBooking(bookingReference) {
    return this.adapter.getBooking(bookingReference)
  }

  getSeatMap(flightCode) {
    return this.adapter.getSeatMap(flightCode)
  }

  addRequest(request) {
    console.log(`[data-src] added ${JSON.stringify(request.toJSON())}`)
    this.requests.push(request)
  }

  acceptRequest(target, created) {
    /**
     * 1. find request in 'library'
     * 2. make change to CX Adapter to update the seatmap
     */
    for (let i in this.requests) {
      const request = this.requests[i]
      
      if (new Date(request.created).getTime() == new Date(created).getTime() && request.fromSeat == target.fromSeat && request.toSeat == target.toSeat) {
        // Inform OLCI before swap
        this.adapter.swapSeats(target.flightCode, target.fromSeat, target.toSeat)
        this.requests[i].status = 'Accepted'
        return this.requests[i]
      }
    }

    return null
  }

  declineRequest(target, created) {
    /**
     * 1. find request in 'library'
     * 2. make change to CX Adapter to update the seatmap
     */
    for (let i in this.requests) {
      const request = this.requests[i]
      
      if (new Date(request.created).getTime() == new Date(created).getTime() && request.fromSeat == target.fromSeat && request.toSeat == target.toSeat) {
        // Inform OLCI before swap
        this.requests[i].status = 'Declined'
        return this.requests[i]
      }
    }

    return null
  }

  getRequests(seatMap, flightSeat) {
    function activeRequest(request) {
      return request.status == 'Pending'
    }

    function relevantSingleSwap(request) {
      return request.isSingle && request.toSeat == flightSeat
    }

    // Identify seat type
    const col = flightSeat.slice(-1)
    let category = null
    if (seatMap.aisle.includes(col)) category = 'aisle'
    if (seatMap.window.includes(col)) category = 'window'

    function relevantMultiSwap(request) {
      return !request.isSingle && category != null && request.category == category
    }

    return this.requests.filter(activeRequest).filter(req => relevantSingleSwap(req) || relevantMultiSwap(req))
  }

  getPendingRequests(flightCode, flightSeat) {
    return this.requests.filter(request => request.flightCode == flightCode 
                      && request.fromSeat == flightSeat 
                      && request.status == 'Pending')
  }

  takeSeat(flightCode, seat) {
    this.adapter.takeSeat(flightCode, seat)
  }

  releaseSeat(flightCode, seat) {
    this.adapter.releaseSeat(flightCode, seat)
  }

}

// Singleton pattern used for single source of truth

/** @type {DataSource} */
let instance = null
function getInstance() {
  if (!instance) instance = new DataSource()
  return instance
}

module.exports = {
  getInstance: getInstance
}