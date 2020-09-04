'use strict'

const { joi } = require('fvi-node-utils/src/objects')

const withHashKey = joi.object({
    hashKey: joi.object().length(1).required().options({ stripUnknown: true }),
})

const withRangeKey = joi.object({
    rangeKey: joi.object().length(1).required().options({ stripUnknown: true }),
})

const withHashAndRangeKey = joi.object({
    hashKey: joi.object().length(1).required().options({ stripUnknown: true }),
    rangeKey: joi.object().length(1).required().options({ stripUnknown: true }),
})

module.exports = {
    withHashKey,
    withRangeKey,
    withHashAndRangeKey,
}
