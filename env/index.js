'use strict'

const google = (process.env.GOOGLE_CLIENT_ID)
  ? {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
  : null

module.exports = ({ auth }) => ({
  auth: {
    cookie: process.env.COOKIE || auth.cookie || 'composition-jwt',
    secret: process.env.SECRET || auth.secret || undefined,
    google: google || auth.google
  }
})
