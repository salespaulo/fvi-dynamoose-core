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

describe('Testing hash-with-range services', () => {
    let id = null
    let repo = null

    before(() => {
        id = uuid.v4()
        repo = repository()
        repo.map(
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
    })
    after(() => repo.close())

    it('Testing hashWithRangeService.create - OK', done => {
        const instance = app(repo.get('model1'))
        instance.hashWithRangeService
            .create(
                { id },
                { tenantId: 'tenantId' },
                { prop1: 'prop1', prop2: 'prop2', unknown: 'here' }
            )
            .then(res => {
                testMutations(id, res, 201)
                done()
            })
            .catch(done)
    })
    it('Testing hashWithRangeService.update - OK', done => {
        const instance = app(repo.get('model1'))
        instance.hashWithRangeService
            .update({ id }, { tenantId: 'tenantId' }, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashWithRangeService.queryByHashKey - OK', done => {
        const instance = app(repo.get('model1'))
        instance.hashWithRangeService
            .queryByHashKey({ id }, { tenantId: 'tenantId' })
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashWithRangeService.query - OK', done => {
        const instance = app(repo.get('model1'))
        instance.hashWithRangeService
            .query({ tenantId: 'tenantId' })
            .then(res => {
                testQueries(id, res, 200)
                done()
            })
            .catch(done)
    })
    it('Testing hashWithRangeService.delete - OK', done => {
        const instance = app(repo.get('model1'))
        instance.hashWithRangeService
            .delete({ id }, { tenantId: 'tenantId' })
            .then(res => {
                testMutations(id, res, 200)
                done()
            })
            .catch(done)
    })
})
