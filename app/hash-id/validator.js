'use strict'

const Validator = require('fastest-validator')

const validator = new Validator()

const validateIdExists = validator.compile({
    id: {
        type: 'string'
    }
})

module.exports = {
    validateIdExists
}
