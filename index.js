e strict'

const ramda = require('ramda')
const expect = require('chai').expect
const mongo = require('mongodb')
const randa = require('randa')
const divelog = require('../../../../models/backend/divelog-model')

function moid (char) {
  return ramda.range(0, 24).map(_ => char[0]).join('')
}

describe('要刪除一個欄位，就設 null', () => {
  const owner = moid('a')
  const log = {
    key: `2016,1,13,14,25,0-${owner}`,
    _DiveCondition: {
      avgTemperature: 20,
      wave: 1
    },
    _DiveGear: {
      thickness: 2,
      airTank: {
        volume: 3
      }
    },
    ownerId: owner,
    diveComputerBrand: '',
    diveComputerModel: '',
    version: 1,
    appVersion: 'test',
    diveDTRaw: '2016,1,13,14,25,0',
    status: 'Raw'
  }

  let _server = null
  before(() => {
    _server = require('../../../../server')
    return _server.init()
  })


  after(() => Promise.all([
    MongoConn.db.collection('LogDive').deleteMany({ownerId: mongo.ObjectID(owner)})
  ]))

  it('又沒寫在測什麼', () => {
    let log2 = {
      _DiveCondition: {
        avgTemperature: null
      },
      _DiveGear: {
        thickness: null,
        airTank: {
          volume: null
        }
      }
    }
    return divelog.upsert(log, true)
        .then((log) => divelog.upsert(ramda.assoc('_id', log._id, log2), true))
        .then((log) => MongoConn.db.collection('LogDive').findOne({_id: mongo.ObjectID(log._id)}))
        .then((log) => {
          expect(ramda.equals(log._DiveCondition, {})).eql(true)
          expect(ramda.equals(log._DiveGear, {airTank: {}})).eql(true)
        })
  })
})

