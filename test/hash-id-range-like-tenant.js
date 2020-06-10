'use strict'

const uuid = require('uuid')
const repository = require('fvi-dynamoose-repository')
const {
    hashKeyString,
    rangeKeyString,
    requiredString,
    optionalString,
} = require('fvi-dynamoose-utils')

const app = require('../app')
const { testQueries, testMutations } = require('./utils')

const MODEL_NAME = 'model3'

describe('Testing hash-id-range-tenant services', () => {
    let id = null
    let repo = null
    let hashLikeIdRangeLikeTenant = null

    before(() => {
        id = uuid.v4()
        repo = repository()
        repo.map(
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
        const instance = app(repo.get(MODEL_NAME))
        hashLikeIdRangeLikeTenant = instance.hashLikeIdRangeLikeTenant('tenantId')
    })
    after(() => repo.close())

    it('Testing hashLikeIdRangeLikeTenant.create - OK', done => {
        hashLikeIdRangeLikeTenant
            .create({ id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res, 201)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenant.update - OK', done => {
        hashLikeIdRangeLikeTenant
            .update(id, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenant.queryByHashKey - OK', done => {
        hashLikeIdRangeLikeTenant
            .queryById(id)
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenant.query - OK', done => {
        hashLikeIdRangeLikeTenant
            .query()
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenant.delete - OK', done => {
        hashLikeIdRangeLikeTenant
            .delete(id)
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
})
