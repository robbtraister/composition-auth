'use strict'

const cookieParser = require('cookie-parser')
const jsonwebtoken = require('jsonwebtoken')
const passport = require('passport')
const { Strategy: JwtStrategy } = require('passport-jwt')

const { Redirect } = require('../errors')

const algorithm = 'HS512'

function authenticate (strategy, { cookie, secret } = {}) {
  const successRedirect = !options.successRedirect
    ? null
    : options.successRedirect instanceof Function
    ? options.successRedirect
    : () => options.successRedirect

  return (req, res, next) => {
    if (req.user) {
      next()
    } else {
      passport.authenticate(strategy, options, (err, user) => {
        if (err) {
          next(err)
        } else if (user) {
          req.user = user
          const token = jsonwebtoken.sign({ usr: req.user }, secret, {
            algorithm
          })
          res.cookie(cookie, token, {
            httpOnly: true
          })
          successRedirect ? next(new Redirect(successRedirect(req))) : next()
        } else {
          next()
        }
      })(req, res, next)
    }
  }
}

module.exports = options => {
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: secret,
        jwtFromRequest: req => req && req.cookies && req.cookies[cookie],
        algorithms: [algorithm]
      },
      function (payload, done) {
        done(null, payload.usr)
      }
    )
  )

  return [cookieParser(), authenticate('jwt', options)]
}

module.exports.authenticate = authenticate
