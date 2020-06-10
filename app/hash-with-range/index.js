'use strict'

const Validator = require('fastest-validator')

const { debug } = require('fvi-node-utils')
const { inspect } = require('fvi-node-utils/app/objects')
const { toDbLastKey, toLastKey } = require('fvi-dynamoose-utils')

const validator = new Validator()

const validate = (hashKey, rangeKey) => {
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

    return validator.validate({ ...hashKey, ...rangeKey }, schema)
}

const all = async (model, rangeKey, startKey, limit) => {
    if (startKey && limit) {
        const lastKey = toDbLastKey({ ...startKey, ...rangeKey })
        return await model.scan.all(lastKey, limit)
    }

    if (startKey) {
        const lastKey = toDbLastKey({ ...startKey, ...rangeKey })
        return await model.scan.all(lastKey)
    }

    const keys = Object.keys(rangeKey)
    const key = keys[0]
    const value = rangeKey[key]

    if (limit) {
        return await model.scan
            .from(key)
            .contains(value)
            .limit(limit)
            .exec()
    }

    return await model.scan
        .from(key)
        .contains(value)
        .exec()
}

/**
 *
 * @param {*} logPrefix Prefixo do log, string.
 * @param {*} model Modelo para acessar o repositorio, object.
 * @param {*} rangeKey Range Key dynamoose, object.
 * @param {*} startHashKey Objeto completo, exemplo, { id: '1234'} ou { nome: 'Ola' }.
 * @param {*} limit
 */
const queryFactory = (logPrefix, model) => async (
    rangeKey,
    startHashKey = false,
    limit = false
) => {
    debug.here(
        `${logPrefix}[Consultar]: rangeKey=${inspect(rangeKey)}; startHashKey=${inspect(
            startHashKey
        )}`
    )

    const data = await all(model, rangeKey, startHashKey, limit)
    const returnStatus = 200

    debug.here(
        `${logPrefix}[Consultar]: rangeKey=${inspect(rangeKey)}; startHashKey=${inspect(
            startHashKey
        )}; status=${returnStatus}`
    )
    debug.here(
        `${logPrefix}[Consultar]: rangeKey=${inspect(rangeKey)}; startHashKey=${inspect(
            startHashKey
        )}; data=${inspect(data)}`
    )

    return {
        status: returnStatus,
        data: {
            LastKey: data.lastKey ? toLastKey(data.lastKey) : null,
            Count: data.count,
            Items: data,
        },
    }
}

const queryByHashKeyFactory = (logPrefix, model) => async (hashKey, rangeKey) => {
    debug.here(
        `${logPrefix}[Consultar Hash Key]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}`
    )

    const checks = validate(hashKey, rangeKey)

    if (checks.length) {
        debug.here(
            `${logPrefix}[Consultar Hash Key][ERROR]: hashKey=${inspect(
                hashKey
            )}; rangeKey=${inspect(rangeKey)}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.get({ ...hashKey, ...rangeKey })
    const returnStatus = 200

    debug.here(
        `${logPrefix}[Consultar Hash Key]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; status=${returnStatus}`
    )
    debug.here(
        `${logPrefix}[Consultar Hash Key]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; data=${inspect(data)}`
    )

    if (!data) {
        return {
            status: 404,
            data: {
                type: 'not_found',
                message: `${logPrefix}: Not Found hashKey=${inspect(hashKey)}; rangeKey=${inspect(rangeKey)}`,
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

const createFactory = (logPrefix, model) => async (hashKey, rangeKey, obj) => {
    debug.here(`${logPrefix}[Salvar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(rangeKey)}`)
    debug.here(
        `${logPrefix}[Salvar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; obj=${inspect(obj)}`
    )

    const checks = validate(hashKey, rangeKey)

    if (checks.length) {
        debug.here(
            `${logPrefix}[Salvar][ERROR]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
                rangeKey
            )}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const exists = await model.get({ ...hashKey, ...rangeKey })

    if (exists) {
        return {
            status: 400,
            data: {
                type: 'bad_request',
                message: `${logPrefix}: Already Exists hashKey=${inspect(
                    hashKey
                )}; rangeKey=${inspect(rangeKey)}`,
            },
        }
    }

    const data = await model.create({ ...hashKey, ...rangeKey, ...obj })
    const returnStatus = 201

    debug.here(
        `${logPrefix}[Salvar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; data=${inspect(data)}`
    )
    debug.here(
        `${logPrefix}[Salvar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; status=${returnStatus}`
    )

    return {
        status: returnStatus,
        data,
    }
}

const updateFactory = (logPrefix, model) => async (hashKey, rangeKey, obj) => {
    debug.here(
        `${logPrefix}[Atualizar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(rangeKey)}`
    )
    debug.here(
        `${logPrefix}[Atualizar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; obj=${inspect(obj)}`
    )

    const checks = validate(hashKey, rangeKey)
    // atributos auto-gerenciaveis (timestamp)
    delete obj.updatedAt
    delete obj.createdAt

    if (checks.length) {
        debug.here(
            `${logPrefix}[Atualizar][ERROR]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
                rangeKey
            )}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.update({ ...hashKey, ...rangeKey }, obj)
    const returnStatus = 200

    debug.here(
        `${logPrefix}[Atualizar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; status=${returnStatus}`
    )
    debug.here(
        `${logPrefix}[Atualizar]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; data=${inspect(data)}`
    )

    return {
        status: returnStatus,
        data,
    }
}

const deleteFactory = (logPrefix, model) => async (hashKey, rangeKey) => {
    debug.here(`${logPrefix}[Excluir]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(rangeKey)}`)

    const checks = validate(hashKey, rangeKey)

    if (checks.length) {
        debug.here(
            `${logPrefix}[Excluir][ERROR]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
                rangeKey
            )}; error=${inspect(checks)}`
        )
        return {
            status: 400,
            data: checks,
        }
    }

    const data = await model.delete({ ...hashKey, ...rangeKey })
    const returnStatus = 200

    debug.here(
        `${logPrefix}[Excluir]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; data=${inspect(data)}`
    )
    debug.here(
        `${logPrefix}[Excluir]: hashKey=${inspect(hashKey)}; rangeKey=${inspect(
            rangeKey
        )}; status=${returnStatus}`
    )

    return {
        status: returnStatus,
        data,
    }
}

module.exports = model => {
    const logPrefix = `[service][${model.name}]`

    return {
        create: createFactory(logPrefix, model),
        delete: deleteFactory(logPrefix, model),
        update: updateFactory(logPrefix, model),
        query: queryFactory(logPrefix, model),
        queryByHashKey: queryByHashKeyFactory(logPrefix, model),
    }
}
