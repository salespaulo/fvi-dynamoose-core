'use strict'

const hashWithRangeFactory = require('../hash-with-range')

module.exports = model => tenantId => {
    const service = hashWithRangeFactory(model)

    return {
        create: obj => service.create({ id: obj.id }, { tenantId }, obj),
        delete: id => service.delete({ id }, { tenantId }),
        update: (id, obj) => service.update({ id }, { tenantId }, obj),
        query: (startKey = false, limit = false) => {
            const startHashKey = startKey ? { id: startKey } : false
            return service.query({ tenantId }, startHashKey, limit)
        },
        queryById: id => service.queryByHashKey({ id }, { tenantId }),
    }
}
