'use strict'

const uuid = require('uuid')
const repository = require('fvi-dynamoose-repository')
const {
    hashKeyString,
    rangeKeyString,
    requiredString,
    optionalString,
} = require('fvi-dynamoose-utils')

const { hashIdRangeTenantFactory } = require('../src')
const { testQueryOne, testMutations } = require('./utils')

const MODEL_NAME = 'model3'

describe('Testing hash-id-range-tenant services', () => {
    let id = null
    let instance = null

    before(() => {
        const repo = repository()
        id = uuid.v4()
        instance = hashIdRangeTenantFactory(
            repo
                .map(
                    MODEL_NAME,
                    {
                        id: hashKeyString(),
                        tenantId: rangeKeyString(),
                        prop1: requiredString(),
                        prop2: optionalString(),
                    },
                    { saveUnknown: true },
                    { waitForActive: true }
                )
                .get(MODEL_NAME)
        )('tenantId')
    })

    it('Testing instance.create - OK', done => {
        instance
            .create({ id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing instance.update - OK', done => {
        instance
            .update(id, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing instance.queryOne - OK', done => {
        instance
            .queryOne(id)
            .then(res => {
                testQueryOne(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing instance.delete - OK', done => {
        instance
            .delete(id)
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })
})
