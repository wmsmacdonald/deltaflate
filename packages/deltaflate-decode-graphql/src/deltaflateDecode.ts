import { ETag, DecoderDictionaryStore, ImDecoder } from "./types";

// TODO support imparams
function getIms(headers: Headers): Array<string> {
  return headers.has("im") ? headers.get("im").split(", ") : [];
}

export async function deltaflateDecode<Dictionary>(
  decoderDictionaryStore: DecoderDictionaryStore<Dictionary>,
  eTagsToDictionaries: Map<ETag, Dictionary>,
  // must preserve order as in createDeltaRequest
  imDecoders: Array<ImDecoder<Dictionary>>,
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

    const newResponseBody = decoderDictionaryStore.read(
      decodedResponseBody,
      matchingETag
    );

    // TODO don't mutate headers
    response.headers.delete("Delta-Base");
    response.headers.delete("IM");

    return new Response(newResponseBody, {
      status: 200,
      statusText: "OK",
      headers: response.headers
    });
  } else {
    return response;
  }
}

export default deltaflateDecode;
