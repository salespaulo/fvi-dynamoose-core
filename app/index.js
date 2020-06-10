'use strict'

const hashOnlyFactory = require('./hash-only')
const hashWithRangeFactory = require('./hash-with-range')

const hashIdFactory = require('./hash-id')
const hashIdRangeTenantFactory = require('./hash-id-range-tenant')

module.exports = model => {
    return {
        hashOnly: hashOnlyFactory(model),
        hashWithRange: hashWithRangeFactory(model),
        hashLikeId: hashIdFactory(model),
        hashLikeIdRangeLikeTenant: hashIdRangeTenantFactory(model),
    }
}
