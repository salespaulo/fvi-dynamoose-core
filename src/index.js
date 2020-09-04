'use strict'

const hashOnlyFactory = require('./hash-only')
const hashWithRangeFactory = require('./hash-with-range')

const hashIdFactory = require('./hash-id')
const hashIdRangeTenantFactory = require('./hash-id-range-tenant')

module.exports = {
    hashOnlyFactory,
    hashWithRangeFactory,
    hashIdFactory,
    hashIdRangeTenantFactory,
}
