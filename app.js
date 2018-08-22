// ---- Modules ----
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const logger = require('morgan')
const passport = require('passport')
const path = require('path')

// ---- Services ----
const ErrorResponse = require('./src/services/ErrorResponse')
const passportStrategy = require('./src/services/passportStrategy')
const authenticate = require('./src/services/authenticate')

// ---- Routers ----
const apiRouter = require('./src/routes/api')

// ---- Application ----
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000

// ---- Middleware setup ----

// Make sure user has Internet connection
app.use((req, res, next) => {
  require('dns').resolve('www.google.com', err => {
    if (err) return res.json({ error: "Your device does not have Internet connection." })
    next()
  })
})

app.use(logger('dev'))                              // log requests
app.use(bodyParser.json({ limit: '1024kb' }))       // parse JSON from req.body
app.use(bodyParser.urlencoded({ extended: true }))  // parse URL encoded data
app.use(cookieParser())

app.use(session({
  secret: 'innovation',
  resave: false,
  saveUninitialized: false
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => done(null, JSON.stringify(user)))
passport.deserializeUser((userString, done) => done(null, JSON.parse(userString)))
passport.use('login', passportStrategy.loginStrategy)

// ----- Top-level routing ----

// Delegation of account control services
require('./src/services/accountControl')(app, passport)

// API routing
app.use('/api', authenticate.userIsLogin, apiRouter)

app.use('/login', express.static(path.join(__dirname, 'public/login/login.html')))
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')))
app.use(express.static(path.join(__dirname, 'public/login')))

app.use('/index', authenticate.userIsLoginRedirect, express.static(path.join(__dirname, 'public/index.html')))
app.use('/'     , authenticate.userIsLoginRedirect, express.static(path.join(__dirname, 'public/')))

// ---- Socket connection ----
require('./src/controllers/socketController')(io)

// ----- Default route & error handler ----
app.use((req, res, next) => next(new ErrorResponse("Not Found", 404)))

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    status: err.status
  })
})

// ---- Server ----
server.listen(port, () => console.log(`Listening on port ${port}`))