'use strict'

class Unauthorized extends Error {
  constructor (...args) {
    super(...args)
    this.status = 401
  }
}

module.exports = Unauthorized
