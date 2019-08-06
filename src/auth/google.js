'use strict'

const bodyParser = require('body-parser')
const { Router } = require('express')
const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')

const { authenticate } = require('./jwt')

const defaultRedirect = '/'

module.exports = (options) => {
  const { google } = options

  return (google)
    ? () => {
      passport.use(
        new GoogleStrategy(
          {
            ...google,
            callbackURL: 'http://localhost:8080/auth/google/callback'
          },
          function (accessToken, refreshToken, profile, done) {
            done(null, {
              email: profile.emails[0].value,
              name: profile.name.givenName
            })
          }
        )
      )

      const router = Router()

      router.use('/callback', bodyParser.urlencoded({ extended: true }))
      router.use((req, res, next) =>
        authenticate('google', {
          ...options,
          scope: ['email', 'profile'],
          state: req.query.redirect
            ? JSON.stringify({ redirect: req.query.redirect })
            : undefined,
          successRedirect: req => {
            try {
              return JSON.parse(req.query.state).redirect || defaultRedirect
            } catch (_) {
              return defaultRedirect
            }
          }
        })(req, res, next)
      )

      return router
    }
    : () => (req, res, next) => {
      res.sendStatus(405)
    }
}
