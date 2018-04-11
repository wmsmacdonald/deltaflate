import 'mocha';
import { InMemoryCache } from "apollo-cache-inmemory";
import { Request, Response } from 'node-fetch';
import { GraphQlEncoderDictionaryStore } from "../src/index";
import gql from 'graphql-tag';
import * as hash from 'object-hash';
import { expect } from 'chai';

describe("GraphQLEncoderDictionaryStore", () => {
  it("should store query/result", async () => {
    let dictionaryStore = new GraphQlEncoderDictionaryStore<any>(
      () => new InMemoryCache()
    );

    const query = gql`
      {
        movies
      }
    `;

    const request = new Request('', {
      method: 'POST',
      body: JSON.stringify(query)
    })

    const cache = new InMemoryCache();

    const result = {
        movies: ['Finding Nemo', 'Goodfellas']
      };

    const response = new Response(JSON.stringify({
      data: result
    }));

    const dictionary = cache.extract();

    await dictionaryStore.write(request, response, dictionary);

    expect(dictionaryStore.has(hash(dictionary))).to.be.true;
  });
});
