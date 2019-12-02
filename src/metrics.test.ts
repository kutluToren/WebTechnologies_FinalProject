import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"
import { notDeepEqual } from 'assert'

const dbPath: string = './db/db_test'
var dbMet: MetricsHandler

  describe('Metrics', function () {
    before(function () {
      LevelDB.clear(dbPath)
      dbMet = new MetricsHandler(dbPath)
    })

    after(function () {
      dbMet.closeDB()
    })

  describe('#get', function () {
    it('should get empty array on non existing group', function (next) {
      dbMet.getOne(11, function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
        next();
      })
    })
    it('should get empty array on non existing group',function(){
      var met: Metric[]=[]
        met.push(new Metric('1221122123',10))

      dbMet.save(10,met, (err:Error|null) =>{
        dbMet.getOne(10, (err: Error | null, result?: Metric[])=>{

          expect(err).to.be.null
          expect(result).to.not.be.undefined
          if(result)
            expect(result[0].value).to.equal(10)

        })
      })
    })
  })
})