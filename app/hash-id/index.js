'use strict'

const { debug } = require('fvi-node-utils')
const { inspect } = require('fvi-node-utils/app/objects')
const { toDbLastKey, toLastKey } = require('fvi-dynamoose-utils')

const validator = require('./validator')

const all = async (model, startKey, limit) => {
    if (startKey && limit) {
        const lastKey = toDbLastKey({ id: startKey })
        return await model.scan.all(lastKey, limit)
    }

    if (startKey) {
        const lastKey = toDbLastKey({ id: startKey })
        return await model.scan.all(lastKey)
    }

    if (limit) {
        return await model.scan.all(false, limit)
    }

    return await model.scan.all()
}

const queryFactory = (logPrefix, model) => async (startKey = false, limit = false) => {
    debug.here(`${logPrefix}[query]: by=${inspect({ startKey, limit })}`)

    const data = await all(model, startKey, limit)
    const returnStatus = 200

    debug.here(`${logPrefix}[query]: status=${returnStatus}`)
    debug.here(`${logPrefix}[query]: data=${inspect(data)}`)

    return {
        status: returnStatus,
        data: {
            LastKey: data.lastKey ? toLastKey(data.lastKey) : null,
            Count: data.count,
            Items: data,
        },
    }
}

const queryByIdFactory = (logPrefix, model) => async id => {
    debug.here(`${logPrefix}[queryById]: Id=${id}`)

    const checks = validator.validateIdExists({ id })

    if (checks.length) {
        debug.here(`${logPrefix}[queryById] ::ERROR:=${inspect(checks)}`)
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.get({ id })
    const returnStatus = 200

    if (!data) {
        return {
            status: 404,
            data: {
                type: 'not_found',
                message: `${logPrefix}: Not Found id=${id}`,
            },
        }
    }

    debug.here(`${logPrefix}[queryById]: Id=${id}; status=${returnStatus}`)
    debug.here(`${logPrefix}[queryById]: Id=${id}; data=${inspect(data)}`)

    return {
        status: returnStatus,
        data: {
            Count: 1,
            Items: [data],
        },
    }
}

const createFactory = (logPrefix, model) => async obj => {
    debug.here(`${logPrefix}[create]: Obj=${inspect(obj)}`)
    const checks = validator.validateIdExists(obj)

    if (checks.length) {
        debug.here(`${logPrefix}[create] ::ERROR:=${inspect(checks)}`)
        return {
            status: 400,
            data: checks,
        }
    }

    const id = obj.id
    const exists = await model.get({ id })

    if (exists) {
        return {
            status: 400,
            data: {
                type: 'bad_request',
                message: `${logPrefix}: Already Exists id=${id}`,
            },
        }
    }

    const data = await model.create(obj)

    const returnStatus = 201
    debug.here(`${logPrefix}[create]: Id=${data.id}; data=${inspect(data)}`)
    debug.here(`${logPrefix}[create]: Id=${data.id}; status=${returnStatus}`)

    return {
        status: returnStatus,
        data,
    }
}

const updateByIdFactory = (logPrefix, model) => async (id, obj) => {
    delete obj.updatedAt
    delete obj.createdAt
    obj.id = id

    debug.here(`${logPrefix}[update]: Id=${id}; Obj=${inspect(obj)}`)
    const checks = validator.validateIdExists({ id, ...obj })

    if (checks.length) {
        debug.here(`${logPrefix}[update] ::ERROR:=${inspect(checks)}`)
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.update({ id }, obj)

    const returnStatus = 200
    debug.here(`${logPrefix}[update]: Id=${data.id}; data=${inspect(data)}`)
    debug.here(`${logPrefix}[update]: Id=${data.id}; status=${returnStatus}`)

    return {
        status: returnStatus,
        data,
    }
}

const deleteByIdFactory = (logPrefix, model) => async id => {
    debug.here(`${logPrefix}[delete]: Id=${id}`)
    const checks = validator.validateIdExists({ id })

    if (checks.length) {
        debug.here(`${logPrefix}[delete] ::ERROR:=${inspect(checks)}`)
        return {
            status: 400,
            data: checks,
        }
    }

    const resGetById = await queryByIdFactory(logPrefix, model)(id)

    if (resGetById.status != 200) {
        return resGetById
    }

    const data = await model.delete({ id })

    const returnStatus = 200
    debug.here(`${logPrefix}[delete]: Id=${data.id}; data=${inspect(data)}`)
    debug.here(`${logPrefix}[delete]: Id=${data.id}; status=${returnStatus}`)

    return {
        status: returnStatus,
        data,
    }
}

const hashOnly = require('../hash-only')

module.exports = model => {
    const service = hashOnly(model)
    const logPrefix = `${model.name}`

    return {
        create: obj => service.create({ id: obj.id }, obj),
        update: (id, obj) => service.update({ id }, obj),
        delete: id => service.delete({ id }),
        queryById: id => service.queryByHashKey({ id }),
        query: (startKey = false, limit = false) => {
            const startHashKey = startKey ? { id: startKey } : false
            return service.query(startHashKey, limit)
        },
    }
}
