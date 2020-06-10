'use strict'

const chai = require('chai')

const testIt = (res, status) => {
    chai.assert.exists(res, 'res is null!')
    chai.assert.exists(res.status, 'res.status is null!')
    chai.assert.exists(res.data, 'res.data is null!')
    chai.assert.equal(status, res.status, 'res.status is invalid!')
}

const testMutations = (id, res, status) => {
    testIt(res, status)
    chai.assert.exists(res.data.id, 'res.data.id is null!')
    chai.assert.equal(id, res.data.id, 'data.id is invalid!')
}

const testQueries = (id, res, status) => {
    testIt(res, status)

    chai.assert.exists(res.data.Count, 'res.data.Count is null!')
    chai.assert.exists(res.data.Items, 'res.data.Items is null!')
    chai.assert.equal(1, res.data.Count, 'res.data.Count is invalid!')
    chai.assert.exists(res.data.Items[0], 'res.data.Items[0] is null!')
    chai.assert.exists(res.data.Items[0].id, 'res.data.Items[0].id is null!')
    chai.assert.exists(res.data.Items[0].unknown, 'res.data.Items[0].unknown is null!')

    chai.assert.equal(id, res.data.Items[0].id, 'res.data.Items[0].id is invalid!')
    chai.assert.equal('here', res.data.Items[0].unknown, 'res.data.Items[0].unknown is invalid!')
}

module.exports = {
    testQueries,
    testMutations,
}
