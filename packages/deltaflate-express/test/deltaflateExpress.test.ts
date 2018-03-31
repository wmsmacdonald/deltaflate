import 'mocha';
import { deltaflateExpress } from '../src/';
import { EncoderDictionaryStore, ImEncoder } from '../../deltaflate-encode/src';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as express from 'express';
import fetch, { Headers }from 'node-fetch';

const PORT = 5656;

describe("deltaflateExpress", () => {
  describe("single request", () => {
    const mockImEncoder: ImEncoder<string> = {
      name: 'mockIm',
      encode() {
        return Buffer.from('some delta');
      }
    }

    let server;
    beforeEach(async () => {
      const app = express();
      const dictionaryStore: EncoderDictionaryStore<string> = {
        has: () => true,
        get: () => 'someDictionary',
        delete: () => {},
        write: () => {},
        createETag: () => 'someETag'
      }
      app.use(
        "/",
        deltaflateExpress(dictionaryStore, [mockImEncoder]),
        (request, response) => {
          response.writeHead(200);
          response.end('response body');
        }
      );
      await new Promise(resolve => (server = app.listen(PORT, resolve)));
    });
    afterEach(() => {
      server.close();
    });

    it("should return 226 with delta", async () => {
      const headers = new Headers();
      headers.append('A-IM', 'mockIm');
      headers.append('If-None-Match', 'someETag');
      const response = await fetch(`http://localhost:${PORT}`, {
        headers
      });

      expect(response.status).to.equal(226);

      const responseBody = await response.text();

      expect(responseBody).to.equal('some delta');
    });
  });
});
