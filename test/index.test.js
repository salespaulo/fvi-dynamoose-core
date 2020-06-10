'use strict'

const chai = require('chai')
const repository = require('fvi-dynamoose-repository')
const { hashKeyString, rangeKeyString } = require('fvi-dynamoose-utils')

const app = require('../app')

describe('Testing Dynamoose Core', () => {
    let repo = null

    before(() => {
        repo = repository()
        repo.map('model1', {
            id: hashKeyString(),
            tenantId: rangeKeyString(),
        })
    })
    after(() => repo.close())

    it('Testing Init - OK', done => {
        const instance = app(repo.get('model1'))
        chai.assert.exists(instance, 'instance is null!')
        done()
    })
    it('Testing Init - FAIL', done => {
        try {
            app(null)
            done('Should be throws an error!')
        } catch (e) {
            done()
        }
    })
    it('Testing app methods - OK', done => {
        const instance = app(repo.get('model1'))
        chai.assert.exists(instance.hashWithRangeService, 'instance.hashWithRangeService is null!')
        chai.assert.exists(instance.hashLikeIdService, 'instance.hashLikeIdService is null!')
        chai.assert.exists(instance.hashOnlyService, 'instance.hashOnlyService is null!')
        chai.assert.exists(
            instance.hashLikeIdRangeLikeTenantService,
            'instance.hashLikeIdRangeLikeTenantService is null!'
        )
        done()
    })
})
