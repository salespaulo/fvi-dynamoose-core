'use strict'

const uuid = require('uuid')
const repository = require('fvi-dynamoose-repository')
const {
    hashKeyString,
    requiredString,
    optionalString,
} = require('fvi-dynamoose-utils')

const app = require('../app')
const { testQueries, testMutations } = require('./utils')

const MODEL_NAME = 'model2'

describe('Testing hash-id services', () => {
    let id = null
    let repo = null

    before(() => {
        id = uuid.v4()
        repo = repository()
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
    })
    after(() => repo.close())

    it('Testing hashLikeId.create - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashLikeId
            .create({ id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res, 201)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeId.update - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashLikeId
            .update(id, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeId.queryByHashKey - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashLikeId
            .queryById(id)
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })

    it('Testing hashLikeId.delete - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashLikeId
            .delete(id)
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
})
