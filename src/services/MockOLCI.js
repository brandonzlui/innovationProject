class MockOLCI {

  constructor() {

  }

  retrieveBooking(bookingReference) {
    const flightCode = 'CX888'
    if (bookingReference.startsWith('1')) {
      return {
        flightCode: flightCode,
        flightSeat: '10A'
      }
    }

    if (bookingReference.startsWith('2')) {
      return {
        flightCode: flightCode,
        flightSeat: '10C'
      }
    }

    return null
  }

}

module.exports = MockOLCI