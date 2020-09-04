'use strict'

const chai = require('chai')
const repository = require('fvi-dynamoose-repository')
const { hashKeyString, rangeKeyString } = require('fvi-dynamoose-utils')

const app = require('../src')

const MODEL_NAME = 'model1'

describe('Testing Dynamoose Services', () => {
    it('Testing Init - OK', done => {
        chai.assert.exists(app)
        chai.assert.isObject(app)
        chai.assert.isFunction(app.hashOnlyFactory)
        chai.assert.isFunction(app.hashIdFactory)
        chai.assert.isFunction(app.hashWithRangeFactory)
        chai.assert.isFunction(app.hashIdRangeTenantFactory)
        done()
    })

    describe(`Testing create services`, () => {
        let repo = null

        before(() => {
            repo = repository()
            repo.map(MODEL_NAME, {
                id: hashKeyString(),
                tenantId: rangeKeyString(),
            })
        })

        it(`Test creating services - OK`, done => {
            app.hashOnlyFactory(repo.get(MODEL_NAME))
            app.hashIdFactory(repo.get(MODEL_NAME))
            app.hashWithRangeFactory(repo.get(MODEL_NAME))
            app.hashIdRangeTenantFactory(repo.get(MODEL_NAME))('tenantId')
            done()
        })
    })
})
