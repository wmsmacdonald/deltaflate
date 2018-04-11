import { first } from "lodash";
import { Request, Response, Headers } from "node-fetch";
import { ImEncoder, EncoderDictionaryStore, ETag } from "./types";
import jsondiffpatchImEncoder from "./jsondiffpatchImEncoder";

// TODO support imparams
function extractAImValues(headers: Headers): Array<string> {
  return headers.has("a-im") ? headers.get("a-im").split(", ") : [];
}

function extractIfNoneMatchValues(headers: Headers): Array<string> {
  return headers.has("if-none-match")
    ? headers.get("if-none-match").split(", ")
    : [];
}

export interface DictionaryStoreMatch<DictionaryType> {
  eTag: ETag;
  dictionary: DictionaryType;
}

function findDictionaryStoreMatch<DictionaryType>(
  aImValues,
  dictionaryStore
): DictionaryStoreMatch<DictionaryType> | undefined {
  return first(
    aImValues
      .filter(eTag => dictionaryStore.has(eTag))
      .map(eTag => ({ eTag, dictionary: dictionaryStore.get(eTag) }))
  );
}

function decideIm<DictionaryType>(
  requestHeaders,
  imEncoders
): ImEncoder<DictionaryType> | undefined {
  const clientRequestedIms = new Set(extractAImValues(requestHeaders));
  return imEncoders.find(({ name }) => clientRequestedIms.has(name));
}

export async function deltaflateEncode<DictionaryType>(
  dictionaryStore: EncoderDictionaryStore<DictionaryType>,
  imEncoders: Array<ImEncoder<DictionaryType>> = [jsondiffpatchImEncoder],
  request: Request,
  response: Response
) {
  const imEncoder = decideIm(request.headers, imEncoders);

  const responseBody = await response.clone().buffer();

  const storeMatch:
    | DictionaryStoreMatch<DictionaryType>
    | undefined = findDictionaryStoreMatch(
    extractIfNoneMatchValues(request.headers),
    dictionaryStore
  );

  if (storeMatch === undefined || imEncoder === undefined) {
    dictionaryStore.write(request, response);
    return response;
  } else {
    dictionaryStore.delete(storeMatch.eTag);

    dictionaryStore.write(request, response, storeMatch.dictionary);

    const encodedBody = imEncoder.encode(storeMatch.dictionary, responseBody);

    // TODO don't mutate input response
    response.headers.append("Delta-Base", storeMatch.eTag);
    response.headers.append("IM", imEncoder.name);

    const deltaResponse = new Response(encodedBody, {
      status: 226,
      statusText: response.statusText,
      headers: response.headers
    });

    return deltaResponse;
  }
}
export default deltaflateEncode;
