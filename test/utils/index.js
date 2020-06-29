'use strict'

const chai = require('chai')

const testIt = res => {
    chai.assert.exists(res, 'res is null!')
}

const testMutations = (id, res) => {
    testIt(res)
    chai.assert.exists(res.id, 'res.id is null!')
    chai.assert.equal(id, res.id, 'data.id is invalid!')
}

const testQueryOne = (id, res) => {
    testIt(res)

    chai.assert.exists(res, 'res is null!')
    chai.assert.exists(res, 'res.Items[0] is null!')
    chai.assert.exists(res.id, 'res.Items[0].id is null!')
    chai.assert.exists(res.unknown, 'res.Items[0].unknown is null!')

    chai.assert.equal(id, res.id, 'res.Items[0].id is invalid!')
    chai.assert.equal('here', res.unknown, 'res.Items[0].unknown is invalid!')
}

const testQueries = (id, res) => {
    testIt(res)

    chai.assert.exists(res, 'res is null!')
    chai.assert.exists(res.count, 'res.count is null!')
    chai.assert.equal(1, res.count, 'res.count is invalid!')
    chai.assert.exists(res[0], 'res[0] is null!')
    chai.assert.exists(res[0].id, 'res[0].id is null!')
    chai.assert.exists(res[0].unknown, 'res[0].unknown is null!')

    chai.assert.equal(id, res[0].id, 'res[0].id is invalid!')
    chai.assert.equal('here', res[0].unknown, 'res[0].unknown is invalid!')
}

module.exports = {
    testQueryOne,
    testQueries,
    testMutations,
}
