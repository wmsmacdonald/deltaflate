import 'mocha';
import { Response, Headers, Request } from 'node-fetch';
import { deltaflateDecode, ETag, DecoderDictionaryStore } from '../src';
import { expect } from 'chai';
import { jsondiffpatchImDecoder } from '../src/jsondiffpatchImDecoder';
import { TextEncoder } from 'text-encoding';

global["Request"] = Request;
global["Response"] = Response;

describe('deltaflateDecode', () => {
  describe('response is not delta encoded', async () => {
    const response = new Response('responseBody', {
      status: 200,
      headers: new Headers()
    });

    const eTagsToDictionaries = new Map<ETag, string>([['someEtag', 'someDictionary']]);

    class MockDecoderDictionaryStore implements DecoderDictionaryStore<string> {
      async read() {
        return [];
      }
      write() {
        throw new Error('should not be called');
      }
    }

    const dictionaryStore = new MockDecoderDictionaryStore();

    const imDecoders = [jsondiffpatchImDecoder];

    const decodedResponse = await deltaflateDecode(dictionaryStore, eTagsToDictionaries, imDecoders, response);

    expect(await decodedResponse.text()).to.equal('responseBody');
  });
  describe('response is delta encoded', () => {
    it('should decode response', async () => {
      const headers = new Headers();
      headers.set('IM', 'someIm');
      const response = new Response('someDelta', {
        status: 226,
        headers
      });

      const eTagsToDictionaries = new Map<ETag, string>([['someEtag', 'someDictionary']]);

      class MockDecoderDictionaryStore implements DecoderDictionaryStore<string> {
        async read() {
          return [];
        }
        write(response, matchingETag) {
          expect(response.status).to.equal(226);
          expect(matchingETag).to.equal('someEtag');
        }
      }

      const dictionaryStore = new MockDecoderDictionaryStore();

      const imDecoders = [{
        name: 'someIm',
        decode(dictionary, body) {
          expect(dictionary).to.equal('someDictionary');
          expect(new Buffer(body).toString()).to.equal('someDelta');

          return new TextEncoder().encode('decodedBody').buffer;
        }
      }];

      const decodedResponse = await deltaflateDecode(dictionaryStore, eTagsToDictionaries, imDecoders, response);

      expect(await decodedResponse.text()).to.deep.equal('decodedBody');
    });
  });
});