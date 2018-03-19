import 'isomorphic-fetch';
import { ETag, DecoderDictionaryStore, ImDecoder } from "./types";

// TODO support imparams
function getIms(headers: Headers): Array<string> {
  return headers.has("im") ? headers.get("im").split(", ") : [];
}

export async function deltaflateDecode<DictionaryType>(
  decoderDictionaryStore: DecoderDictionaryStore<DictionaryType>,
  eTagsToDictionaries: Map<ETag, DictionaryType>,
  // must preserve order as in createDeltaRequest
  imDecoders: Array<ImDecoder<DictionaryType>>,
  response: Response
) {
  if (response.status === 226) {
    const matchingETag = response.headers.has("Delta-Base")
      ? response.headers.get("Delta-Base")
      : eTagsToDictionaries.keys().next().value;

    const matchingDictionary = eTagsToDictionaries.get(matchingETag);

    const ims = new Set(getIms(response.headers));
    const decoders = imDecoders.filter(({ name }) => ims.has(name));

    const decodedResponseBody = decoders.reduce(
      (body, { decode }) => decode(matchingDictionary, body),
      await response.arrayBuffer()
    );

    decoderDictionaryStore.write(
      response,
      matchingETag
    );

    // TODO don't mutate headers
    response.headers.delete("Delta-Base");
    response.headers.delete("IM");

    return new Response(decodedResponseBody, {
      status: 200,
      statusText: "OK",
      headers: response.headers
    });
  } else {
    return response;
  }
}

export default deltaflateDecode;
