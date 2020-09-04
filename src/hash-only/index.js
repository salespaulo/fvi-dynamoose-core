'use strict'

const { debug } = require('fvi-node-utils')
const { inspect } = require('fvi-node-utils/src/objects')

const { withHashKey } = require('./schema')
const { APP_PREFIX, newInvalidInputSchema, newNotFoundById, newAlreadyExists } = require('../utils')

const queryOneFactory = (debugPrefix, model) => async hashKey => {
    debug.here(`${debugPrefix}[queryOne]: hashKey=${inspect(hashKey)}`)

    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(`${debugPrefix}[queryOne]`, checks.error)
    }

    const data = await model.query.getOne(hashKey)

    debug.here(`${debugPrefix}[queryOne]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)
    return data
}

const queryOneOrThrowFactory = (debugPrefix, model) => async hashKey => {
    const data = await queryOneFactory(debugPrefix, model)(hashKey, rangeKey)

    if (data == null) {
        throw newNotFoundById(debugPrefix, model.name, hashKey)
    }

    return data
}

const queryHashBeginsWithFactory = (debugPrefix, model) => async (hashKey, startAt, limit) => {
    debug.here(`${debugPrefix}[queryHashBeginsWith]: hashKey=${inspect(hashKey)}`)
    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const field = Object.keys(hashKey)[0]
    const value = Object.values(hashKey)[0]
    const queryHashKey = model.scan.from(field).beginsWith(value)

    if (startAt != null) {
        queryHashKey.startAt(startAt)
    }

    if (limit != null) {
        queryHashKey.limit(limit)
    }

    const data = await queryHashKey.exec()

    debug.here(
        `${debugPrefix}[queryHashBeginsWith]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`
    )
    return data
}

const queryHashContainsFactory = (debugPrefix, model) => async (hashKey, startAt, limit) => {
    debug.here(`${debugPrefix}[queryHashContains]: hashKey=${inspect(hashKey)}`)
    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const field = Object.keys(hashKey)[0]
    const value = Object.values(hashKey)[0]
    const queryHashKey = model.scan.from(field).contains(value)

    if (startAt != null) {
        queryHashKey.startAt(startAt)
    }

    if (limit != null) {
        queryHashKey.limit(limit)
    }

    const data = await queryHashKey.exec()

    debug.here(
        `${debugPrefix}[queryHashContains]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`
    )

    return data
}

const createFactory = (debugPrefix, model) => async (hashKey, obj) => {
    debug.here(`${debugPrefix}[create]: hashKey=${inspect(hashKey)}; obj=${inspect(obj)}`)
    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const exists = await model.query.getOne(hashKey)

    if (exists != null) {
        throw newAlreadyExists(debugPrefix, model.name, hashKey)
    }

    const data = await model.create({ ...hashKey, ...obj })

    debug.here(`${debugPrefix}[create]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)
    return data
}

const updateFactory = (debugPrefix, model) => async (hashKey, obj) => {
    debug.here(`${debugPrefix}[update]: hashKey=${inspect(hashKey)}; obj=${inspect(obj)}`)
    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const data = await model.update(hashKey, obj)

    debug.here(`${debugPrefix}[update]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)

    return data
}

const deleteFactory = (debugPrefix, model) => async hashKey => {
    debug.here(`${debugPrefix}[delete]: hashKey=${inspect(hashKey)}`)
    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const data = await model.delete(hashKey)

    debug.here(`${debugPrefix}[delete]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)
    return data
}

module.exports = model => {
    const debugPrefix = `${APP_PREFIX}[hash-only][${model.name}]`

    return {
        create: createFactory(debugPrefix, model),
        delete: deleteFactory(debugPrefix, model),
        update: updateFactory(debugPrefix, model),
        queryOne: queryOneFactory(debugPrefix, model),
        queryOneOrThrow: queryOneOrThrowFactory(debugPrefix, model),
        queryHashContains: queryHashContainsFactory(debugPrefix, model),
        queryHashBeginsWith: queryHashBeginsWithFactory(debugPrefix, model),
    }
}
