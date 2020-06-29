'use strict'

const uuid = require('uuid')
const repository = require('fvi-dynamoose-repository')
const { hashKeyString, requiredString, optionalString } = require('fvi-dynamoose-utils')

const { hashIdFactory } = require('../app')
const { testQueryOne, testMutations } = require('./utils')

const MODEL_NAME = 'model2'

describe('Testing hash-id services', () => {
    let id = null
    let instance = null

    before(() => {
        const repo = repository()
        repo.map(
            MODEL_NAME,
            {
                id: hashKeyString(),
                prop1: requiredString(),
                prop2: optionalString(),
            },
            { saveUnknown: true },
            { waitForActive: true }
        )

        id = uuid.v4()
        const model = repo.get(MODEL_NAME)
        instance = hashIdFactory(model)
    })

    it('Testing create - OK', done => {
        instance
            .create({ id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing update - OK', done => {
        instance
            .update(id, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryOne - OK', done => {
        instance
            .queryOne(id)
            .then(res => {
                testQueryOne(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing delete - OK', done => {
        instance
            .delete(id)
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })
})
