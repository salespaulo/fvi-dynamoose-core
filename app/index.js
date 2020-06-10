'use strict'

const hashOnlyFactory = require('./hash-only')
const hashWithRangeFactory = require('./hash-with-range')

const hashIdFactory = require('./hash-id')
const hashIdRangeTenantFactory = require('./hash-id-range-tenant')

module.exports = model => {
    return {
        hashOnlyService: hashOnlyFactory(model),
        hashWithRangeService: hashWithRangeFactory(model),
        hashLikeIdService: hashIdFactory(model),
        hashLikeIdRangeLikeTenantService: hashIdRangeTenantFactory(model),
    }
}
