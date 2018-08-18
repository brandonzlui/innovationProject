// Modules
const LocalStrategy = require('passport-local').Strategy

// Dependencies
const CXAdapter = require('../adapters/CXAdapter')

// Data source setup
const cxData = new CXAdapter()

// Strategy setup
const strategyOptions = {
  usernameField: 'bookingReference',
  passwordField: 'bookingReference',
  passReqToCallback: true
}

const loginStrategy = new LocalStrategy(strategyOptions, (req, bookingReference, _, done) => { 
  const [err, user] = cxData.getBooking(bookingReference)
  if (err) return done(err, null)
  return done(null, user)
})

module.exports = {
  loginStrategy: loginStrategy
}