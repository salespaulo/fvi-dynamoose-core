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
    let hashLikeIdRangeLikeTenantService = null

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
        hashLikeIdRangeLikeTenantService = instance.hashLikeIdRangeLikeTenantService('tenantId')
    })
    after(() => repo.close())

    it('Testing hashLikeIdRangeLikeTenantService.create - OK', done => {
        hashLikeIdRangeLikeTenantService
            .create({ id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res, 201)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenantService.update - OK', done => {
        hashLikeIdRangeLikeTenantService
            .update(id, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenantService.queryByHashKey - OK', done => {
        hashLikeIdRangeLikeTenantService
            .queryById(id)
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenantService.query - OK', done => {
        hashLikeIdRangeLikeTenantService
            .query()
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashLikeIdRangeLikeTenantService.delete - OK', done => {
        hashLikeIdRangeLikeTenantService
            .delete(id)
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
})
