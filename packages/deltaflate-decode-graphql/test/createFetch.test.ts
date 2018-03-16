import { Request, Response, Headers } from 'node-fetch';
import jsondiffpatchImDecoder from '../../deltaflate-decode/src/jsondiffpatchImDecoder';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { DiffPatcher } from 'jsondiffpatch';
import * as hash from 'object-hash';

import { createFetch } from '../src';

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

    const stubFetch = () => Promise.resolve(new Response(
      JSON.stringify(delta),
      {
        status: 223,
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