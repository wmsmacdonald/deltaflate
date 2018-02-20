
import { first } from "lodash";
import { Request, Response, Headers } from "node-fetch";

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

export type ETag = string;

export interface EncoderDictionaryStore<DictionaryType> {
  has(eTag: ETag): Boolean;
  get(eTag: ETag): DictionaryType;
  remove(eTag: ETag): void;
  write(request: Request, response: Response, dictionary?: DictionaryType): void;
  createETag(dictionary: DictionaryType): string;
}

export interface ImEncoder<DictionaryType> {
  name: string;
  encode(dictionary: DictionaryType, body: Buffer): Buffer;
}

export async function deltaflateEncode<DictionaryType>(
  dictionaryStore: EncoderDictionaryStore<DictionaryType>,
  imEncoders: Array<ImEncoder<DictionaryType>>,
  request: Request,
  response: Response
) {
  function decideIm(requestHeaders: Headers): ImEncoder<DictionaryType> | undefined {
    const clientRequestedIms = new Set(getAIms(requestHeaders));
    return imEncoders.find(({ name }) => clientRequestedIms.has(name));
  }

  function getCacheMatch(request: Request): CacheMatch<DictionaryType> | undefined {
    return first(
      getIfNoneMatch(request.headers)
        .filter(eTag => dictionaryStore.has(eTag))
        .map(eTag => ({ eTag, dictionary: dictionaryStore.get(eTag) }))
    );
  }

  const imEncoder = decideIm(request.headers);

  const responseBody = await response.buffer();

  const cacheMatch = getCacheMatch(request);

  if (cacheMatch === undefined || imEncoder === undefined) {
    dictionaryStore.write(response);
    return response;
  } else {
    dictionaryStore.remove(cacheMatch.eTag);

    dictionaryStore.write(response);

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