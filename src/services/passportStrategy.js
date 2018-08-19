// Modules
const LocalStrategy = require('passport-local').Strategy

// Data source setup
const DataSource = require('../models/DataSource')
const cxData = DataSource.getInstance()

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