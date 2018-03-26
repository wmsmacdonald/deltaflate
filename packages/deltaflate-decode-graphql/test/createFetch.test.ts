import 'mocha';
import 'isomorphic-fetch';
import fetch, { Request, Response, Headers } from 'node-fetch';
import jsondiffpatchImDecoder from '../../deltaflate-decode/src/jsondiffpatchImDecoder';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { DiffPatcher } from 'jsondiffpatch';
import * as hash from 'object-hash';

import { createFetch } from '../src';

global["Request"] = Request;
global["Response"] = Response;
global["fetch"] = fetch;

const diffPatcher = new DiffPatcher();

describe('createFetch', () => {
  it('sadfas', async () => {

    const clientCache = new InMemoryCache();
    const serverCache = new InMemoryCache();

    const query = gql`
      {
        movies
      }
    `;

    const data = {
      movies: ['Finding Nemo', 'Goodfellas']
    }

    serverCache.writeQuery({ query, data });

    const delta = diffPatcher.diff(clientCache.extract(), serverCache.extract());

    const r = new Response('');
    console.log(Response)
    r.arrayBuffer();

    const stubFetch = () => Promise.resolve(new Response(
      JSON.stringify(delta),
      {
        status: 226,
        statusText: 'OK',
        headers: new Headers({
          'IM': 'jsondiffpatch'
        })
      }
    ));

    const fetcher = createFetch(clientCache, [jsondiffpatchImDecoder], hash, stubFetch);

    const response = await fetcher(new Request('', {
      method: 'POST',
      body: JSON.stringify(query)
    }));
  });
});