'use strict'

const hashOnly = require('../hash-only')

module.exports = model => {
    const service = hashOnly(model)

    return {
        create: obj => service.create({ id: obj.id }, obj),
        delete: id => service.delete({ id }),
        update: (id, obj) => service.update({ id }, obj),
        queryOne: id => service.queryOne({ id }),
        queryOneOrThrow: id => service.queryOneOrThrow({ id }),
        queryIdContains: id => service.queryHashContains({ id }),
        queryIdBeginsWith: id => service.queryHashBeginsWith({ id }),
    }
}
