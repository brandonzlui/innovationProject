const ErrorResponse = require('../services/ErrorResponse')
const OLCI = require('../services/MockOLCI')

class CXAdapter {

  constructor() {
    this.cxDataSource = new OLCI()
  }

  /**
   * Retrieve booking from CX data source.
   * @returns [error, { flightCode, flightSeat }] 
   */
  getBooking(bookingReference) {
    const record = this.cxDataSource.retrieveBooking(bookingReference)
    if (!record) return [new ErrorResponse(`Booking reference ${bookingReference} not found.`, 404), null]

    const user = {
      flightCode: record.flightCode,
      flightSeat: record.flightSeat
    }

    return [null, user]
  }

  getSeatMap(flightCode) {
    const seatMap = this.cxDataSource.retrieveSeatMap(flightCode)
    if (!seatMap) return [new ErrorResponse(`Seat map for ${flightCode} not found.`, 404), null]

    return [null, seatMap]
  }

}

module.exports = CXAdapter