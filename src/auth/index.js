'use strict'

const { Router } = require('express')
const passport = require('passport')

const { Redirect, Unauthorized } = require('../errors')

passport.serializeUser(function (user, done) {
  done(null, JSON.stringify(user))
})

passport.deserializeUser(function (token, done) {
  done(null, JSON.parse(token))
})

function router ({ auth: options = {} } = {}) {
  const router = Router()

  router.use(/(\/auth)?\/(log|sign)out/, (req, res, next) => {
    res.clearCookie(options.cookie)
    next(new Redirect('/'))
  })

  router.use(passport.initialize())

  // options.local && router.use('/auth/local', require('./local')(options))
  options.google && router.use('/auth/google', require('./google')(options))
  router.use(require('./jwt')(options))

  router.use((req, res, next) => {
    if (req.user) {
      next()
    } else {
      next(new Unauthorized())
    }
  })

  router.use(/(\/auth)?\/use?r/, (req, res, next) => {
    req.query.jsonp && /^[$_a-z][$_a-z0-9]*$/i.test(req.query.jsonp)
      ? res.send(`/**/;${req.query.jsonp}(${JSON.stringify(req.user)})`)
      : res.send({ user: req.user })
  })

  return router
}

module.exports = router
