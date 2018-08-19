class SwapRequest {

  constructor(flightCode, fromSeat, companions, message) {
    this.created = new Date()
    this.flightCode = flightCode
    this.fromSeat = fromSeat
    this.companions = companions
    this.message = message

    // Initialise unused fields
    this.status = null
    this.isSingle = null
    this.toSeat = null
    this.category = null
  }

  setSingleSwap(toSeat) {
    this.isSingle = true
    this.toSeat = toSeat
  } 

  setMultiSwap(category) {
    this.isSingle = false
    this.category = category
  }

  setStatus(accepted) {
    this.status = accepted
  }

  toJSON() {
    const res = {
      created: this.created,
      flightCode: this.flightCode,
      fromSeat: this.fromSeat,
      companions: this.companions,
      message: this.message,
      status: this.status,
      isSingle: this.isSingle
    }

    if (this.isSingle) res.toSeat = this.toSeat
    else res.category = this.category

    return res
  }

}

module.exports = SwapRequest