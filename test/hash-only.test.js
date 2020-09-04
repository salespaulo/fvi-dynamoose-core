'use strict'

const uuid = require('uuid')
const chai = require('chai')
const repository = require('fvi-dynamoose-repository')
const { hashKeyString, requiredString, optionalString } = require('fvi-dynamoose-utils')

const { hashOnlyFactory } = require('../src')
const { testQueryOne, testMutations } = require('./utils')

const MODEL_NAME = 'model4'

describe('Testing hash-only services', () => {
    let id = null
    let instance = null

    before(() => {
        const repo = repository()
        id = uuid.v4()
        instance = hashOnlyFactory(
            repo
                .map(
                    MODEL_NAME,
                    {
                        id: hashKeyString(),
                        prop1: requiredString(),
                        prop2: optionalString(),
                    },
                    { saveUnknown: true }
                )
                .get(MODEL_NAME)
        )
    })

    it('Testing create - OK', done => {
        instance
            .create({ id }, { id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing create - Already Exists', done => {
        instance
            .create({ id }, { id, prop1: 'prop1', prop2: 'prop2', unknown: 'here' })
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
            .update({ id }, { prop1: 'xxx', prop2: 'prop2' })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing queryOne - OK', done => {
        instance
            .queryOne({ id })
            .then(res => {
                testQueryOne(id, res)
                done()
            })
            .catch(done)
    })

    it('Testing delete - OK', done => {
        instance
            .delete({ id })
            .then(res => {
                testMutations(id, res)
                done()
            })
            .catch(done)
    })
})
