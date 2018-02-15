import {
  DecoderDictionaryStore,
  ETagsToDictionaries,
  ETag,
  ImDecoder
} from "./types";

export async function createDeltaRequest<Dictionary>(
  decoderDictionaryStore: DecoderDictionaryStore<Dictionary>,
  imDecoders: Array<ImDecoder<Dictionary>>,
  request: Request
): Promise<[Request, ETagsToDictionaries<Dictionary> | void]> {
  const responseBody = await request.arrayBuffer();

  const eTagsWithDictionaries = decoderDictionaryStore.get(responseBody);
  if (eTagsWithDictionaries.length === 0) {
    return [request, null];
  } else {
    const eTags = eTagsWithDictionaries.map(([eTag]) => eTag);
    // TODO don't mutate headers
    request.headers.append("If-None-Accept", eTags.join(", "));

    const ims = imDecoders.map(({ name }) => name);
    request.headers.append("a-im", ims.join(", "));
    return [request, new Map(eTagsWithDictionaries)];
  }
}
