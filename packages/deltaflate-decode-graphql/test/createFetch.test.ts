import 'mocha';
import fetch, { Request, Response, Headers } from 'node-fetch';
import { expect } from 'chai';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { DiffPatcher } from 'jsondiffpatch';
import * as hash from 'object-hash';

import jsondiffpatchImDecoder from '../../deltaflate-decode/src/jsondiffpatchImDecoder';

import { createFetch } from '../src';

global["Request"] = Request;
global["Response"] = Response;
global["fetch"] = fetch;

const diffPatcher = new DiffPatcher();

describe('createFetch', () => {
  let stubFetch;
  let clientCache;
  const query = gql`
    {
      movies
    }
  `;
  const data = {
    movies: ['Finding Nemo', 'Goodfellas']
  }
  beforeEach(() => {
    clientCache = new InMemoryCache();
    const serverCache = new InMemoryCache();

    serverCache.writeQuery({ query, data });

    const delta = diffPatcher.diff(clientCache.extract(), serverCache.extract());

    stubFetch = () => Promise.resolve(new Response(
      JSON.stringify(delta),
      {
        status: 226,
        statusText: 'OK',
        headers: new Headers({
          'IM': 'jsondiffpatch'
        })
      }
    ));
  });
  it('resolves correct data', async () => {
    const fetcher = createFetch(clientCache, [jsondiffpatchImDecoder], hash, stubFetch);

    const response = await fetcher(new Request('', {
      method: 'POST',
      body: JSON.stringify(query)
    }));

    const responseBody = await response.json();
    expect(responseBody).to.deep.equal(data);
  });
});