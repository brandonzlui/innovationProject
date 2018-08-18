const MOCK_CODE = 'CX888'

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

    this.seatMap = {}
    this.seatMap[MOCK_CODE] = {
      name: 'AirBus Mini',
      rows: 10,
      seatsPerRow: 6,
      available: ['1A', '2C', '3D', '4F', '5F'],
      aisle: ['C', 'D'],
      window: ['A', 'F']
    }
  }

  retrieveBooking(bookingReference) {
    return this.bookingData[bookingReference]
  }

  retrieveSeatMap(flightCode) {
    return this.seatMap[flightCode]
  }

}

module.exports = MockOLCI