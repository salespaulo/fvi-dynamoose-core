'use strict'

const { debug } = require('fvi-node-utils')
const { inspect } = require('fvi-node-utils/app/objects')

const hashOnly = require('../hash-only')
const { withHashKey, withRangeKey, withHashAndRangeKey } = require('./schema')
const { APP_PREFIX, newInvalidInputSchema, newNotFoundById, newAlreadyExists } = require('../utils')

const queryOneFactory = (debugPrefix, model) => async (hashKey, rangeKey) => {
    debug.here(
        `${debugPrefix}[queryOne]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(rangeKey)}`
    )
    const checks = withHashAndRangeKey.validate({ hashKey, rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(`${debugPrefix}[queryOne]`, checks.error)
    }

    const id = { ...hashKey, ...rangeKey }
    const data = await model.query.getOne(id)

    debug.here(`${debugPrefix}[queryOne]: hashKey=${inspect(id)}; data=${inspect(data)}`)
    return data
}

const queryOneOrThrowFactory = (debugPrefix, model) => async (hashKey, rangeKey) => {
    const data = await queryOneFactory(debugPrefix, model)(hashKey, rangeKey)

    if (data == null) {
        throw newNotFoundById(debugPrefix, model.name, { hashKey, rangeKey })
    }

    return data
}

const queryHashKeyFactory = (debugPrefix, model) => async (hashKey, startAt, limit) => {
    debug.here(`${debugPrefix}[queryHashKey]: hashKey=${inspect(hashKey)}`)
    const checks = withHashKey.validate({ hashKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const field = Object.keys(hashKey)[0]
    const value = Object.values(hashKey)[0]
    const queryHashKey = model.query.from(field).eq(value)

    if (startAt != null) {
        queryHashKey.startAt(startAt)
    }

    if (limit != null) {
        queryHashKey.limit(limit)
    }

    const data = await queryHashKey.exec()

    debug.here(`${debugPrefix}[queryHashKey]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)
    return data
}

const queryRangeKeyFactory = (debugPrefix, model) => async (rangeKey, startAt, limit) => {
    debug.here(`${debugPrefix}[queryRangeKey]: rangeKey=${inspect(rangeKey)}`)
    const checks = withRangeKey.validate({ rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const field = Object.keys(rangeKey)[0]
    const value = Object.values(rangeKey)[0]
    const queryRangeKey = model.scan.from(field).eq(value)

    if (startAt != null) {
        queryRangeKey.startAt(startAt)
    }

    if (limit != null) {
        queryRangeKey.limit(limit)
    }

    const data = await queryRangeKey.exec()

    debug.here(`${debugPrefix}[queryRangeKey]: hashKey=${inspect(rangeKey)}; data=${inspect(data)}`)
    return data
}

const queryRangeBeginsWithFactory = (debugPrefix, model) => async (rangeKey, startAt, limit) => {
    debug.here(`${debugPrefix}[queryRangeBeginsWith]: rangeKey=${inspect(rangeKey)}`)
    const checks = withRangeKey.validate({ rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const field = Object.keys(rangeKey)[0]
    const value = Object.values(rangeKey)[0]
    const queryRangeKey = model.scan.from(field).beginsWith(value)

    if (startAt != null) {
        queryRangeKey.startAt(startAt)
    }

    if (limit != null) {
        queryRangeKey.limit(limit)
    }

    const data = await queryRangeKey.exec()

    debug.here(
        `${debugPrefix}[queryRangeBeginsWith]: hashKey=${inspect(rangeKey)}; data=${inspect(data)}`
    )
    return data
}

const queryHashAndRangeBeginsWithFactory = (debugPrefix, model) => async (
    hashKey,
    rangeKey,
    startAt,
    limit
) => {
    debug.here(
        `${debugPrefix}[queryHashAndRangeBeginsWith]: hashKey=${inspect(
            hashKey
        )}; rangeKey=${inspect(rangeKey)}`
    )
    const checks = withHashAndRangeKey.validate({ hashKey, rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const fieldHash = Object.keys(hashKey)[0]
    const valueHash = Object.values(hashKey)[0]
    const fieldRange = Object.keys(rangeKey)[0]
    const valueRange = Object.values(rangeKey)[0]
    const queryRangeKey = model.query
        .from(fieldHash)
        .eq(valueHash)
        .filter(fieldRange)
        .beginsWith(valueRange)

    if (startAt != null) {
        queryRangeKey.startAt(startAt)
    }

    if (limit != null) {
        queryRangeKey.limit(limit)
    }

    const data = await queryRangeKey.exec()

    debug.here(
        `${debugPrefix}[queryHashAndRangeBeginsWith]: hashKey=${inspect(rangeKey)}; data=${inspect(
            data
        )}`
    )
    return data
}

const queryHashAndRangeContainsFactory = (debugPrefix, model) => async (
    hashKey,
    rangeKeyContains,
    startAt,
    limit
) => {
    debug.here(
        `${debugPrefix}[queryHashAndRangeContains]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKeyContains
        )}`
    )
    const checks = withHashAndRangeKey.validate({ hashKey, rangeKey: rangeKeyContains })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const fieldHash = Object.keys(hashKey)[0]
    const valueHash = Object.values(hashKey)[0]
    const fieldRange = Object.keys(rangeKeyContains)[0]
    const valueRange = Object.values(rangeKeyContains)[0]
    const queryRangeKey = model.scan
        .from(fieldHash)
        .eq(valueHash)
        .filter(fieldRange)
        .contains(valueRange)

    if (startAt != null) {
        queryRangeKey.startAt(startAt)
    }

    if (limit != null) {
        queryRangeKey.limit(limit)
    }

    const data = await queryRangeKey.exec()

    debug.here(
        `${debugPrefix}[queryHashAndRangeContains]: hashKey=${inspect(
            rangeKeyContains
        )}; data=${inspect(data)}`
    )
    return data
}

const createFactory = (debugPrefix, model) => async (hashKey, rangeKey, obj) => {
    debug.here(
        `${debugPrefix}[create]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; obj=${inspect(obj)}`
    )
    const checks = withHashAndRangeKey.validate({ hashKey, rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const id = { ...hashKey, ...rangeKey }
    const exists = await model.query.getOne(id)

    if (exists != null) {
        throw newAlreadyExists(debugPrefix, model.name, id)
    }

    const data = await model.create({ ...id, ...obj })

    debug.here(`${debugPrefix}[create]: id=${inspect(id)}; data=${inspect(data)}`)
    return data
}

const updateFactory = (debugPrefix, model) => async (hashKey, rangeKey, obj) => {
    debug.here(
        `${debugPrefix}[update]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; obj=${inspect(obj)}`
    )
    const checks = withHashAndRangeKey.validate({ hashKey, rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const id = { ...hashKey, ...rangeKey }
    const data = await model.update(id, obj)

    debug.here(`${debugPrefix}[update]: id=${inspect(id)}; data=${inspect(data)}`)
    return data
}

const deleteFactory = (debugPrefix, model) => async (hashKey, rangeKey) => {
    debug.here(`${debugPrefix}[delete]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(rangeKey)}`)
    const checks = withHashAndRangeKey.validate({ hashKey, rangeKey })

    if (checks.error != null) {
        throw newInvalidInputSchema(debugPrefix, checks.error)
    }

    const id = { ...hashKey, ...rangeKey }
    const data = await model.delete(id)

    debug.here(`${debugPrefix}[delete]: id=${inspect(id)}; data=${inspect(data)}`)
    return data
}

module.exports = model => {
    const debugPrefix = `${APP_PREFIX}[hash-with-range][${model.name}]`

    return {
        create: createFactory(debugPrefix, model),
        delete: deleteFactory(debugPrefix, model),
        update: updateFactory(debugPrefix, model),
        queryOne: queryOneFactory(debugPrefix, model),
        queryOneOrThrow: queryOneOrThrowFactory(debugPrefix, model),
        queryHashKey: queryHashKeyFactory(debugPrefix, model),
        queryRangeKey: queryRangeKeyFactory(debugPrefix, model),
        queryRangeBeginsWith: queryRangeBeginsWithFactory(debugPrefix, model),
        queryHashAndRangeBeginsWith: queryHashAndRangeBeginsWithFactory(debugPrefix, model),
        queryHashAndRangeContains: queryHashAndRangeContainsFactory(debugPrefix, model),
        queryHashBeginsWith: hashOnly(model).queryHashBeginsWith,
        queryHashContains: hashOnly(model).queryHashContains,
    }
}
