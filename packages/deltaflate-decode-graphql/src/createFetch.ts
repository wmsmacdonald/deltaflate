//import 'isomorphic-fetch';
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
  fetcher: GlobalFetch["fetch"]
): GlobalFetch["fetch"] {
  const dictionaryStore = new GraphQlDecoderDictionaryStore<TSerialized>(cache);
  return async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);

    const { request: deltaRequest, eTagsToDictionaries } = await createDeltaRequest(
      dictionaryStore,
      imDecoders,
      eTagger,
      request
    );

    const response = await fetcher(deltaRequest);

    const decodedResponse = await deltaflateDecode(
      dictionaryStore,
      eTagsToDictionaries,
      imDecoders,
      response
    );

    await dictionaryStore.write(decodedResponse.clone());
    const query = await request.json();

    const responseBody = cache.readQuery({
      query
    });

    return new Response(JSON.stringify(responseBody), {
      status: decodedResponse.status,
      statusText: decodedResponse.statusText,
      headers: decodedResponse.headers
    });
  };
}
