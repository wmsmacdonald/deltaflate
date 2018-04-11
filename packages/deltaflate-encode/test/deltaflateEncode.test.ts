import 'mocha';
import { expect } from 'chai';
import { Request, Response, Headers } from 'node-fetch';

import { deltaflateEncode, EncoderDictionaryStore } from '../src/index';

import { ImEncoder } from '../src/types';


function assertSameHeaders(headers1: Headers, headers2: Headers) {
  headers1.forEach
  expect(Array.from((headers1 as Headers .entries()))

}

async function assertSameResponses(response1, response2) {
  const [responseBody1, responseBody2] = await Promise.all([response1.clone().text(), response2.clone().text()]);
  expect(responseBody1).to.equal(responseBody2);
  expect(response1.status).to.equal(response2.status);
  expect(response1.statusText).to.equal(response2.statusText);
}

describe('deltaflateEncode', () => {
  const request = new Request('http://example.com', {
    method: 'post',
    body: Buffer.from('request body'),
    headers: {
      'A-IM': 'someImEncoder',
      'If-None-Match': 'someETag'
    }
  });
  const response = new Response('response body', {
    status: 200,
    statusText: 'OK'
  });
  const testDeltaflateEncode = (dictionaryStore, imEncoder, response)
  describe('has dictionary match', () => {
    const encoderDictionaryStore: EncoderDictionaryStore<string> = {
      has: () => true,
      get: () => 'someDictionary',
      write: () => {},
      delete: () => {},
      createETag: () => ''
    }
    describe('has encoder match', () => {
      const imEncoder: ImEncoder<string> = {
        name: 'someImEncoder',
        encode: () => Buffer.from('encoded')
      }

      it('should resolve delta encoded response', async () => {
        const changedResponse = await deltaflateEncode(encoderDictionaryStore, [imEncoder], request, response);
        const responseBody = await changedResponse.text();
        expect(responseBody).to.equal('encoded');
        expect(changedResponse.status).to.equal(226);
        expect(changedResponse.statusText).to.equal('OK');
      });
    });
    describe('has no encoder match', () => {
      const imEncoder: ImEncoder<string> = {
        name: 'differentImEncoder',
        encode: () => Buffer.from('encoded')
      }

      it('should resolve unchanged response', async () => {
        const changedResponse = await deltaflateEncode(encoderDictionaryStore, [imEncoder], request, response);
        const responseBody = await changedResponse.text();
        expect(responseBody).to.equal('response body');
      });
    });
  });
  describe('has no dictionary match', () => {
    const encoderDictionaryStore: EncoderDictionaryStore<string> = {
      has: () => false,
      get: () => '',
      write: () => {},
      delete: () => {},
      createETag: () => ''
    }

    describe('has encoder match', () => {
      const imEncoder: ImEncoder<string> = {
        name: 'someImEncoder',
        encode: () => Buffer.from('encoded')
      }

      it('should resolve unchanged response', async () => {
        const unChangedResponse = await deltaflateEncode(encoderDictionaryStore, [imEncoder], request, response);
      });
    });
    describe('has no encoder match', () => {
      const imEncoder: ImEncoder<string> = {
        name: 'differentImEncoder',
        encode: () => Buffer.from('encoded')
      }

      it('should resolve unchanged response', async () => {
        const changedResponse = await deltaflateEncode(encoderDictionaryStore, [imEncoder], request, response);
        const responseBody = await changedResponse.text();
        expect(responseBody).to.equal('response body');
      });
    });
  });
});