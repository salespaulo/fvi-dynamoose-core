'use strict'

const { debug } = require('fvi-node-utils')
const { inspect } = require('fvi-node-utils/app/objects')

const newInvalidInputSchema = (debugPrefix, error) => {
    const msg = `${debugPrefix}: Invalid input schema error=${inspect(error)}`
    debug.here(msg)
    const e = new Error(msg)
    e.type = 'InvalidInputSchemaError'
    return e
}

const newNotFoundById = (debugPrefix, modelName, id) => {
    const msg = `${debugPrefix}: Not Found Model ${modelName} By id=${inspect(id)}!`
    debug.here(msg)
    const e = new Error(msg)
    e.type = 'NotFoundByIdError'
    return e
}

const newAlreadyExists = (debugPrefix, modelName, id) => {
    const msg = `${debugPrefix}: Already Exists Model ${modelName} By id=${inspect(id)}!`
    debug.here(msg)
    const e = new Error(msg)
    e.type = 'AlreadExistsIdError'
    return e
}

module.exports = {
    newInvalidInputSchema,
    newNotFoundById,
    newAlreadyExists,
    APP_PREFIX: '[dynamoose][service]',
}
