'use strict'

const uuid = require('uuid')
const chai = require('chai')
const repository = require('fvi-dynamoose-repository')
const {
    hashKeyString,
    rangeKeyString,
    requiredString,
    optionalString,
} = require('fvi-dynamoose-utils')

const { hashWithRangeFactory } = require('../app')
const { testQueryOne, testQueries, testMutations } = require('./utils')

describe('Testing hash-with-range services', () => {
    let id = null
    let instance = null

    before(() => {
        const repo = repository()
        id = uuid.v4()
        instance = hashWithRangeFactory(
            repo
                .map(
                    'model1',
                    {
                        id: hashKeyString(),
                        tenantId: rangeKeyString(),
                        prop1: requiredString(),
                        prop2: optionalString(),
                    },
                    { saveUnknown: true },
                    { update: true }
                )
                .get('model1')
        )
    })

    it('Testing create - OK', done => {
        instance
            .create(
                { id },
                { tenantId: 'tenantId' },
                { id, tenantId: 'tenantId', prop1: 'prop1', prop2: 'prop2', unknown: 'here' }
            )
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing create - Already Exists', done => {
        instance
            .create(
                { id },
                { tenantId: 'tenantId' },
                { prop1: 'prop1', prop2: 'prop2', unknown: 'here' }
            )
            .then(res => {
                done('Should be throws an error!')
            })
            .catch(e => {
                chai.assert.isTrue(e.message.includes(`Already Exists`))
                done()
            })
    })

    it('Testing update - OK', done => {
        instance
            .update({ id }, { tenantId: 'tenantId' }, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryOne - OK', done => {
        instance
            .queryOne({ id }, { tenantId: 'tenantId' })
            .then(res => {
                testQueryOne(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryOne - OK', done => {
        instance
            .queryOne({ id }, { tenantId: 'tenantId' })
            .then(res => {
                testQueryOne(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryHashKey - OK', done => {
        instance
            .queryHashKey({ id })
            .then(res => {
                testQueries(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryRangeKey - OK', done => {
        instance
            .queryRangeKey({ tenantId: 'tenantId' })
            .then(res => {
                testQueries(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryHashBeginsWith - OK', done => {
        instance
            .queryHashBeginsWith({ id: id.substr(0, id.length - 3) })
            .then(res => {
                testQueries(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryRangeBeginsWith - OK', done => {
        instance
            .queryHashBeginsWith({ tenantId: 'tenan' })
            .then(res => {
                testQueries(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryHashAndRangeBeginsWith - OK', done => {
        instance
            .queryHashAndRangeBeginsWith({ id }, { tenantId: 'tenan' })
            .then(res => {
                testQueries(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing delete - OK', done => {
        instance
            .delete({ id }, { tenantId: 'tenantId' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })
})
