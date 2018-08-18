module.exports = function(app, passport) {
  app.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (err) return next(err)
      if (!user) return res.status(401).json({ success: false })

      req.logIn(user, err => {
        if (err) return next(err)

        const oldPassport = req.session.passport
        req.session.regenerate(err => {
          req.session.passport = oldPassport
          req.session.save(err => {
            res.status(200).json({
              success: true,
              flightCode: user.flightCode,
              flightSeat: user.flightSeat
            })
          })
        })
      })

    })(req, res, next)
  })

  app.get('/logout', (req, res, next) => {
    req.session.destroy(_ => res.redirect('./login'))
  })

}