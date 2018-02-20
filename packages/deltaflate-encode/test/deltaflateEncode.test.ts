import 'mocha';
import { expect } from 'chai';
import { stub } from 'sinon';
import { Request, Response, Headers } from 'node-fetch';

import { deltaflateEncode, EncoderDictionaryStore, ImEncoder } from '../src/deltaflateEncode';

describe('DeltaflateServer', () => {
  const encoderDictionaryStore: EncoderDictionaryStore<string> = {
    has(eTag) {
      if (eTag !== 'someETag') {
        throw new Error('incorrect ETag');
      }
      else {
        return true;
      }
    },
    get(eTag) {
      if (eTag !== 'someETag') {
        throw new Error('incorrect ETag');
      }
      else {
        return 'hello';
      }
    },
    write() {
    },
    remove() {
    },
    createETag() {
      return '';
    }
  }
  const imEncoder: ImEncoder<string> = {
    name: 'someImEncoder',
    encode(dictionary, body) {
      expect(dictionary).to.equal('hello');

      return new Buffer('encoded');
    }
  }

  it('test', async () => {
    const request = new Request('http://example.com', {
      method: 'post',
      body: new Buffer('hello1'),
      headers: {
        'A-IM': 'someImEncoder',
        'If-None-Match': 'someETag'
      }
    });
    const response = new Response(new Buffer('hello2'), {
      status: 200,
      statusText: 'OK',
      headers: new Headers()
    });
    const changedResponse = await deltaflateEncode(encoderDictionaryStore, [imEncoder], request, response);
    const body = (await changedResponse.buffer()).toString();
    expect(body).to.equal('encoded');
  });
});