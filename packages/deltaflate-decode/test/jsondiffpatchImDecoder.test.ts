import { DiffPatcher } from 'jsondiffpatch';
import { Response } from 'node-fetch';
import { expect } from 'chai';
import * as stringToArrayBuffer from 'string-to-arraybuffer';

import jsondiffpatchImDecoder from '../src/jsondiffpatchImDecoder';

const diffPatcher = new DiffPatcher();

describe('jsondiffpatchImDecoder', () => {
  describe('decode', () => {
    it('sdfasdf', async () => {
      const dictionary = { a: 1 };
      const target = { a: 2 };
      const delta = diffPatcher.diff(dictionary, target);
      

      const decoded = jsondiffpatchImDecoder.decode(dictionary, stringToArrayBuffer(JSON.stringify(delta)));

      expect(JSON.parse(Buffer.from(decoded).toString())).to.deep.equal(target);

      console.log(Object.prototype.toString.call(decoded))

      const response = new Response(decoded);

      console.log(await response.text());

      expect(await response.json()).to.deep.equal(target);
    });
  });
});