'use strict'

const Validator = require('fastest-validator')

const { debug } = require('fvi-node-utils')
const { inspect } = require('fvi-node-utils/app/objects')
const { toDbLastKey, toLastKey } = require('fvi-dynamoose-utils')

const validator = new Validator()

const validate = hashKey => {
    const schema = {}

    const hashKeys = Object.keys(hashKey)
    if (!hashKeys || hashKeys.length == 0) {
        return {
            type: 'required',
            field: 'hashKey',
            message: "The 'Hash Key' field is required!",
        }
    }

    schema[hashKeys[0]] = {
        type: 'string',
        empty: false,
    }

    return validator.validate(hashKey, schema)
}

const all = async (model, startKey, limit) => {
    if (startKey && limit) {
        const lastKey = toDbLastKey(startKey)
        return await model.scan.all(lastKey, limit)
    }

    if (startKey) {
        const lastKey = toDbLastKey(startKey)
        return await model.scan.all(lastKey)
    }

    if (limit) {
        return await model.scan.limit(limit).exec()
    }

    return await model.scan.from().exec()
}

/**
 *
 * @param {*} logPrefix Prefixo do log, string.
 * @param {*} model Modelo para acessar o repositorio, object.
 * @param {*} startHashKey Objeto completo, exemplo, { id: '1234'} ou { nome: 'Ola' }.
 * @param {*} limit
 */
const queryFactory = (logPrefix, model) => async (startHashKey = false, limit = false) => {
    debug.here(`${logPrefix}[query]: startHashKey=${inspect(startHashKey)}`)

    const data = await all(model, startHashKey, limit)
    const returnStatus = 200

    debug.here(`${logPrefix}[query]: startHashKey=${inspect(startHashKey)}; status=${returnStatus}`)
    debug.here(`${logPrefix}[query]: startHashKey=${inspect(startHashKey)}; data=${inspect(data)}`)

    return {
        status: returnStatus,
        data: {
            LastKey: data.lastKey ? toLastKey(data.lastKey) : null,
            Count: data.count,
            Items: data,
        },
    }
}

const queryByHashKeyFactory = (logPrefix, model) => async hashKey => {
    debug.here(`${logPrefix}[queryByHashKey]: hashKey=${inspect(hashKey)}`)

    const checks = validate(hashKey)

    if (checks.length) {
        debug.here(
            `${logPrefix}[queryByHashKey][ERROR]: hashKey=${inspect(hashKey)}; error=${inspect(
                checks
            )}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.get(hashKey)
    const returnStatus = 200

    debug.here(`${logPrefix}[queryByHashKey]: hashKey=${inspect(hashKey)}; status=${returnStatus}`)
    debug.here(`${logPrefix}[queryByHashKey]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)

    if (!data) {
        return {
            status: 404,
            data: {
                type: 'not_found',
                message: `${logPrefix}: Not Found hashKey=${hashKey};`,
            },
        }
    }

    return {
        status: returnStatus,
        data: {
            Count: 1,
            Items: [data],
        },
    }
}

const createFactory = (logPrefix, model) => async (hashKey, obj) => {
    debug.here(`${logPrefix}[create]: hashKey=${inspect(hashKey)};`)
    debug.here(`${logPrefix}[create]: hashKey=${inspect(hashKey)}; obj=${inspect(obj)}`)

    const checks = validate(hashKey)

    if (checks.length) {
        debug.here(
            `${logPrefix}[create][ERROR]: hashKey=${inspect(hashKey)}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const exists = await model.get(hashKey)

    if (exists) {
        return {
            status: 400,
            data: {
                type: 'bad_request',
                message: `${logPrefix}: Already Exists hashKey=${inspect(hashKey)}`,
            },
        }
    }

    const data = await model.create({ ...hashKey, ...obj })
    const returnStatus = 201

    debug.here(`${logPrefix}[create]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)
    debug.here(`${logPrefix}[create]: hashKey=${inspect(hashKey)}; status=${returnStatus}`)

    return {
        status: returnStatus,
        data,
    }
}

const updateFactory = (logPrefix, model) => async (hashKey, obj) => {
    debug.here(`${logPrefix}[update]: hashKey=${inspect(hashKey)} `)
    debug.here(`${logPrefix}[update]: hashKey=${inspect(hashKey)}; obj=${inspect(obj)}`)

    const checks = validate(hashKey)
    // TODO paulosales: atributos auto-gerenciaveis (timestamp)
    delete obj.updatedAt
    delete obj.createdAt

    if (checks.length) {
        debug.here(
            `${logPrefix}[update][ERROR]: hashKey=${inspect(hashKey)}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.update(hashKey, obj)
    const returnStatus = 200

    debug.here(`${logPrefix}[update]: hashKey=${inspect(hashKey)}; status=${returnStatus}`)
    debug.here(`${logPrefix}[update]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)

    return {
        status: returnStatus,
        data,
    }
}

const deleteFactory = (logPrefix, model) => async hashKey => {
    debug.here(`${logPrefix}[delete]: hashKey=${inspect(hashKey)}`)

    const checks = validate(hashKey)

    if (checks.length) {
        debug.here(
            `${logPrefix}[delete][ERROR]: hashKey=${inspect(hashKey)}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.delete(hashKey)
    const returnStatus = 200

    debug.here(`${logPrefix}[delete]: hashKey=${inspect(hashKey)}; data=${inspect(data)}`)
    debug.here(`${logPrefix}[delete]: hashKey=${inspect(hashKey)}; status=${returnStatus}`)

    return {
        status: returnStatus,
        data,
    }
}

module.exports = model => {
    const logPrefix = `[${model.name}[service]`

    return {
        create: createFactory(logPrefix, model),
        delete: deleteFactory(logPrefix, model),
        update: updateFactory(logPrefix, model),
        query: queryFactory(logPrefix, model),
        queryByHashKey: queryByHashKeyFactory(logPrefix, model),
    }
}
