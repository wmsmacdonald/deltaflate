import { Request, Response } from 'whatwg-fetch';
import { ApolloCache } from "apollo-cache";
import { GraphQlDecoderDictionaryStore } from "./GraphQlDecoderDictionaryStore";

import {
  createDeltaRequest,
  deltaflateDecode,
  ImDecoder
} from "../../deltaflate-decode/src";

export function createFetch<TSerialized>(
  cache: ApolloCache<TSerialized>,
  imDecoders: Array<ImDecoder<TSerialized>>,
  eTagger: (TSerialized) => string,
  fetch: GlobalFetch["fetch"]
): GlobalFetch["fetch"] {
  const dictionaryStore = new GraphQlDecoderDictionaryStore<TSerialized>(cache);
  return async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    console.log(await request.text());

    const { request: deltaRequest, eTagsToDictionaries } = await createDeltaRequest(
      dictionaryStore,
      imDecoders,
      eTagger,
      request
    );

    const response = await fetch(deltaRequest);

    const decodedResponse = await deltaflateDecode(
      dictionaryStore,
      eTagsToDictionaries,
      imDecoders,
      response
    );

    dictionaryStore.write(decodedResponse);
    const query = await request.text();
    console.log(query)
    console.log('asdfasdf')

    const responseBody = cache.readQuery(query);

    return new Response(JSON.stringify(responseBody), {
      status: decodedResponse.status,
      statusText: decodedResponse.statusText,
      headers: decodedResponse.headers
    });
  };
}
