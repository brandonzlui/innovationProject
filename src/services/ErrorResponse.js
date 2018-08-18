class ErrorResponse extends Error {

  constructor(message, status, customMessage) {
    super(message)
    this.status = status
    this.customMessage = customMessage
  }

}

module.exports = ErrorResponse