const MOCK_CODE = 'CX888'

const SeatMap = require('../models/SeatMap')

class MockOLCI {

  constructor() {
    this.bookingData = {
      '1QAZ': {
        flightCode: MOCK_CODE,
        flightSeat: '6D'
      },
      '2WSX': {
        flightCode: MOCK_CODE,
        flightSeat: '10A'
      },
      '3EDC': {
        flightCode: MOCK_CODE,
        flightSeat: '10B'
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

  swapSeats(flightCode, fromSeat, toSeat) {
    // Find booking data
    let data1 = null
    let data2 = null
    Object.keys(this.bookingData).forEach(ref => {
      if (this.bookingData[ref].flightCode == flightCode && this.bookingData[ref].flightSeat == fromSeat)
        data1 = ref
        if (this.bookingData[ref].flightCode == flightCode && this.bookingData[ref].flightSeat == toSeat)
        data2 = ref
    })

    if (!data1 || !data2) {
      console.error(`swap seat error`)
      return
    }

    const temp = this.bookingData[data2]
    this.bookingData[data2] = this.bookingData[data1]
    this.bookingData[data1] = temp
  }

}

module.exports = MockOLCI