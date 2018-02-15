
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

export interface CacheMatch<Dictionary> {
  eTag: ETag;
  dictionary: Dictionary;
}

export type ETag = string;

export interface EncoderDictionaryStore<Dictionary> {
  has(eTag: ETag): Boolean;
  get(eTag: ETag): Dictionary;
  write(responseBody: Buffer, dictionaryETag?: ETag): void;
}

export interface ImEncoder<Dictionary> {
  name: string;
  encode(dictionary: Dictionary, body: Buffer): Buffer;
}

export async function deltaflateEncode<Dictionary>(
  dictionaryStore: EncoderDictionaryStore<Dictionary>,
  imEncoders: Array<ImEncoder<Dictionary>>,
  request: Request,
  response: Response
) {
  function decideIm(requestHeaders: Headers): ImEncoder<Dictionary> | undefined {
    const clientRequestedIms = new Set(getAIms(requestHeaders));
    return imEncoders.find(({ name }) => clientRequestedIms.has(name));
  }

  function getCacheMatch(request: Request): CacheMatch<Dictionary> | undefined {
    return first(
      getIfNoneMatch(request.headers)
        .filter(eTag => dictionaryStore.has(eTag))
        .map(eTag => ({ eTag, dictionary: dictionaryStore.get(eTag) }))
    );
  }

  const imEncoder = decideIm(request.headers);

  const clonedResponse = response.clone();
  const responseBody = await clonedResponse.buffer();

  const cacheMatch = getCacheMatch(request);

  if (cacheMatch === undefined || imEncoder === undefined) {
    dictionaryStore.write(responseBody);
    return response;
  } else {
    const encodedBody = imEncoder.encode(cacheMatch.dictionary, responseBody);

    // TODO don't mutate input response
    response.headers.append("Delta-Base", cacheMatch.eTag);
    response.headers.append("im", imEncoder.name);

    dictionaryStore.write(responseBody, cacheMatch.eTag);
    return new Response(encodedBody, {
      status: 226,
      statusText: response.statusText,
      headers: response.headers
    });
  }
}
export default deltaflateEncode;