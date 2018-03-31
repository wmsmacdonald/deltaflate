import { first } from "lodash";
import { Request, Response, Headers } from "node-fetch";
import { ImEncoder, EncoderDictionaryStore, ETag } from "./types";
import jsondiffpatchImEncoder from "./jsondiffpatchImEncoder";

// TODO support imparams
function getAIms(headers: Headers): Array<string> {
  return headers.has("a-im") ? headers.get("a-im").split(", ") : [];
}

function getIfNoneMatch(headers: Headers): Array<string> {
  return headers.has("if-none-match")
    ? headers.get("if-none-match").split(", ")
    : [];
}

export interface CacheMatch<DictionaryType> {
  eTag: ETag;
  dictionary: DictionaryType;
}

export async function deltaflateEncode<DictionaryType>(
  dictionaryStore: EncoderDictionaryStore<DictionaryType>,
  imEncoders: Array<ImEncoder<DictionaryType>> = [jsondiffpatchImEncoder],
  request: Request,
  response: Response
) {
  function decideIm(
    requestHeaders: Headers
  ): ImEncoder<DictionaryType> | undefined {
    const clientRequestedIms = new Set(getAIms(requestHeaders));
    return imEncoders.find(({ name }) => clientRequestedIms.has(name));
  }

  function getCacheMatch(
    request: Request
  ): CacheMatch<DictionaryType> | undefined {
    return first(
      getIfNoneMatch(request.headers)
        .filter(eTag => dictionaryStore.has(eTag))
        .map(eTag => ({ eTag, dictionary: dictionaryStore.get(eTag) }))
    );
  }

  const imEncoder = decideIm(request.headers);

  const responseBody = await response.clone().buffer();

  const cacheMatch = getCacheMatch(request);

  if (cacheMatch === undefined || imEncoder === undefined) {
    dictionaryStore.write(request, response);
    return response;
  } else {
    dictionaryStore.delete(cacheMatch.eTag);

    dictionaryStore.write(request, response, cacheMatch.dictionary);

    const encodedBody = imEncoder.encode(cacheMatch.dictionary, responseBody);

    // TODO don't mutate input response
    response.headers.append("Delta-Base", cacheMatch.eTag);
    response.headers.append("im", imEncoder.name);

    const deltaResponse = new Response(encodedBody, {
      status: 226,
      statusText: response.statusText,
      headers: response.headers
    });

    return deltaResponse;
  }
}
export default deltaflateEncode;
