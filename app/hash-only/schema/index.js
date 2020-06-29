'use strict'

const { joi } = require('fvi-node-utils/app/objects')

const withHashKey = joi.object({
    hashKey: joi.object().length(1).required().options({ stripUnknown: true }),
})

module.exports = {
    withHashKey,
}
