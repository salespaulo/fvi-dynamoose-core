'use strict'

const hashWithRange = require('../hash-with-range')

module.exports = model => tenantId => {
    const service = hashWithRange(model)

    return {
        create: obj => service.create({ id: obj.id }, { tenantId }, obj),
        delete: id => service.delete({ id }, { tenantId }),
        update: (id, obj) => service.update({ id }, { tenantId }, obj),
        queryOne: id => service.queryOne({ id }, { tenantId }),
        queryOneOrThrow: id => service.queryOneOrThrow({ id }, { tenantId }),
        queryId: id => service.queryHashKey({ id }),
        queryTenantId: tenantId => service.queryRangeKey({ tenantId }),
        queryIdBeginsWith: id => service.queryRangeBeginsWith({ id }),
        queryTenantBeginsWith: tenantId => service.queryHashBeginsWith({ tenantId }),
    }
}
