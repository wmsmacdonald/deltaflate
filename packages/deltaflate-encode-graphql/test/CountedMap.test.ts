import 'mocha';
import CountedMap from '../src/CountedMap';
import { expect } from 'chai';


describe('CountedMap', () => {
  let countedMap;
  beforeEach(() => {
    countedMap = new CountedMap<string, string>();
  });

  describe('no calls to .set()', () => {
    it('delete should return false for non existant key', () => {
      expect(countedMap.delete('key1')).to.be.false;
    });
  });

  describe('one call to .set()', () => {
    beforeEach(() => {
      countedMap.set('key1', 'value1');
    });

    it('entry should be deleted after .delete()', () => {
      expect(countedMap.get('key1')).to.equal('value1');
      expect(countedMap.delete('key1')).to.be.true;
      expect(countedMap.has('key1')).to.be.false;
    });
  });

  describe('two calls to .set() on same key', () => {
    beforeEach(() => {
      countedMap.set('key1', 'value1');
      countedMap.set('key1', 'value2');
    });

    it('value should be last', () => {
      expect(countedMap.get('key1')).to.equal('value2');
    });

    describe('.delete() called once on same key', () => {
      beforeEach(() => {
        countedMap.delete('key1');
      });

      it('entry should remain', () => {
        expect(countedMap.has('key1')).to.be.true;
      });
    });

    describe('.delete() called twice on same key', () => {
      beforeEach(() => {
        countedMap.delete('key1');
        countedMap.delete('key1');
      });

      it('entry should be deleted', () => {
        expect(countedMap.has('key1')).to.be.false;
      });
    });
  });
});