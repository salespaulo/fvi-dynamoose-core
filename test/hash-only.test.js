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

const MODEL_NAME = 'model4'

describe('Testing hash-only services', () => {
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
            { saveUnknown: true }
        )
    })
    after(() => repo.close())

    it('Testing hashOnlyService.create - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashOnlyService
            .create({ id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res, 201)
                done()
            })
            .catch(done)
    })
    it('Testing hashOnlyService.update - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashOnlyService
            .update({ id }, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashOnlyService.queryByHashKey - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashOnlyService
            .query()
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashOnlyService.queryByHashKey - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashOnlyService
            .queryByHashKey({ id })
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })

    it('Testing hashOnlyService.delete - OK', done => {
        const instance = app(repo.get(MODEL_NAME))
        instance.hashOnlyService
            .delete({ id })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
})
