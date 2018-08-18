const ErrorResponse = require('../services/ErrorResponse')

class CXAdapter {

  constructor(cxDataSource) {
    this.cxDataSource = cxDataSource
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

}

module.exports = CXAdapter