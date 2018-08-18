const ErrorResponse = require('./ErrorResponse')

function userIsLoginRedirect(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('./login')
}

function userIsLogin(req, res, next) {
  if (req.isAuthenticated()) return next()
  next(new ErrorResponse('Unauthorised access.', 401))
}

module.exports = {
  userIsLoginRedirect: userIsLoginRedirect,
  userIsLogin: userIsLogin
}