import { deltaflateExpress } from '../src/';
import { GraphQLEncoderDictionaryStore } from '../../deltaflate-encode-graphql/src';
import { buildSchema } from 'graphql';
import { expect } from 'chai';
import sinon from 'sinon';
import { DiffPatcher } from 'jsondiffpatch';
import express from 'express';
import { graphqlExpress } from 'apollo-server-express';
import { InMemoryCache } from 'apollo-cache-inmemory';

const diffPatcher = new DiffPatcher();

const PORT = 5656;
const endpoint = `http://localhost:${PORT}/graphql`;

const graphqlSchema = buildSchema(`
  type Query {
    movies: [String!]!
  }
`);

describe("deltaflateExpress", () => {
  describe("single request", () => {
    let server;
    beforeEach(async () => {
      const app = express();
      const root = {
        movies: () => ["Finding Nemo", "Goodfellas"]
      };
      const dictionaryStore = new GraphQLEncoderDictionaryStore(() => new InMemoryCache());
      app.use(
        "/graphql",
        deltaflateExpress(dictionaryStore),
        graphqlExpress({ schema: graphqlSchema, rootValue: root })
      );
      await new Promise(resolve => (server = app.listen(PORT, resolve)));
    });
    afterEach(async () => {
      await new Promise(resolve => server.close(resolve));
    });

    it("should return 200 with expected data", async () => {
      const response = await fetch(`${endpoint}?query={movies}`);

      expect(response.status).to.equal(200);

      const responseData = await response.json();

      expect(responseData.data.movies).to.deep.equal([
        "Finding Nemo",
        "Goodfellas"
      ]);
    });
  });
  /*
  describe("two requests", () => {
    let server;
    beforeEach(async () => {
      const app = express();
      const stub = sinon.stub();
      stub.onFirstCall().returns(["Finding Nemo", "Goodfellas"]);
      stub
        .onSecondCall()
        .returns(["Finding Nemo", "Goodfellas", "Citizen Kane"]);
      const root = {
        movies: stub
      };
      const dictionaryStore = new GraphQLEncoderDictionaryStore(() => new InMemoryCache());
      app.use(
        "/graphql",
        deltaflateExpress(dictionaryStore),
        graphqlExpress({ schema: graphqlSchema, rootValue: root })
      );
      await new Promise(resolve => (server = app.listen(PORT, resolve)));
    });
    afterEach(async () => {
      await new Promise(resolve => server.close(resolve));
    });
    describe("neither request with any delta headers", () => {
      it("should return two 200s with expected data", async () => {
        const response1 = await fetch(`${endpoint}?query={movies}`);
        const response2 = await fetch(`${endpoint}?query={movies}`);

        expect(response1.status).to.equal(200);
        expect(response2.status).to.equal(200);

        const responseData1 = await response1.json();
        const responseData2 = await response2.json();

        expect(responseData1.data.movies).to.deep.equal([
          "Finding Nemo",
          "Goodfellas"
        ]);
        expect(responseData2.data.movies).to.deep.equal([
          "Finding Nemo",
          "Goodfellas",
          "Citizen Kane"
        ]);
      });
    });

    describe("both with A-IM header but neither with If-None-Match", () => {
      it("should return two 200s with expected data", async () => {
        const headers = {
          'A-IM': 'jsondiffpatch'
        };
        const response1 = await fetch(`${endpoint}?query={movies}`, { headers });
        const response2 = await fetch(`${endpoint}?query={movies}`, { 
          headers: {
            ...headers,
            'If-None-Accept': `"${response1.headers.get('etag')}"`
          }
        });

        expect(response1.status).to.equal(200);
        expect(response2.status).to.equal(200);

        const responseData1 = await response1.json();
        const responseData2 = await response2.json();

        expect(responseData1.data.movies).to.deep.equal([
          "Finding Nemo",
          "Goodfellas"
        ]);
        expect(responseData2.data.movies).to.deep.equal([
          "Finding Nemo",
          "Goodfellas",
          "Citizen Kane"
        ]);
      });
    });
    describe("both have A-IM header, only second has If-None-Match", () => {
      it("should return 200 and 226 with correct delta", async () => {
        const response1 = await fetch(`${endpoint}?query={movies}`, { headers: {
          'A-IM': 'jsondiffpatch'
        }});

        expect(response1.headers.etag).to.not.be.null;

        const response2 = await fetch(`${endpoint}?query={movies}`, {
          headers: {
            'A-IM': 'jsondiffpatch',
            'If-None-Match': response1.headers.get('etag')
          }
        });

        expect(response1.status).to.equal(200);
        expect(response2.status).to.equal(226);

        const response1Buffer = await response1.buffer();
        const response2Buffer = await response2.buffer();

        const delta = JSON.parse(response2Buffer.toString());
        const target = diffPatcher.patch()

        const target = vcd.vcdiffDecodeSync(response2Buffer, { dictionary: response1Buffer });
        expect(JSON.parse(target).data.movies).to.deep.equal([
          "Finding Nemo",
          "Goodfellas",
          "Citizen Kane"
        ]);
      });
    });
  });
  */
});
