import { GraphQlDecoderDictionaryStore } from '../src/GraphQlDecoderDictionaryStore';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Response } from 'node-fetch';
import gql from 'graphql-tag';
import { expect } from 'chai';

describe('GraphQlDecoderDictionareStore', () => {
  it('cache should be restored with response', async () => {
    const clientCache = new InMemoryCache();
    const serverCache = new InMemoryCache();

    const dictionaryStore = new GraphQlDecoderDictionaryStore<any>(clientCache);

    const query = gql`
      {
        movies
      }
    `;

    const data = {
      movies: ['Finding Nemo', 'Goodfellas']
    }

    serverCache.writeQuery({
      query,
      data
    });

    const response = new Response(JSON.stringify(serverCache.extract()));

    await dictionaryStore.write(response);

    const { movies } = clientCache.readQuery({
      query
    });
    expect(movies).to.deep.equal(data.movies);

    const dictionary = await dictionaryStore.read();
    expect(dictionary[0]).to.deep.equal(serverCache.extract());
  });
});