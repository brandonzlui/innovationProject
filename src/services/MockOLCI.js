const MOCK_CODE = 'CX888'

const SeatMap = require('../models/SeatMap')

class MockOLCI {

  constructor() {
    this.bookingData = {
      '1QAZ': {
        flightCode: MOCK_CODE,
        flightSeat: '10A'
      },
      '2WSX': {
        flightCode: MOCK_CODE,
        flightSeat: '10C'
      }
    }

    this.seatMaps = {}
    this.seatMaps[MOCK_CODE] = new SeatMap(
      'AirBus Mini',                    // name
      10,                               // rows
      6,                                // seats per row
      ['1A', '2C', '3D', '4F', '5F'],   // available
      ['C', 'D'],                       // aisle
      ['A', 'F']                        // window
    )
  }

  retrieveBooking(bookingReference) {
    return this.bookingData[bookingReference]
  }

  retrieveSeatMap(flightCode) {
    return this.seatMaps[flightCode]
  }

  takeSeat(flightCode, flightSeat) {
    const index = this.seatMaps[flightCode].available.indexOf(flightSeat)
    if (index < 0) return false

    this.seatMaps[flightCode].available.splice(index, 1)
    return true
  }

  releaseSeat(flightCode, flightSeat) {
    const index = this.seatMaps[flightCode].available.indexOf(flightSeat)
    if (index >= 0) return false

    this.seatMaps[flightCode].available.push(flightSeat)
    return true
  }

}

module.exports = MockOLCI