import {
  DecoderDictionaryStore,
  ETagsToDictionaries,
  ImDecoder
} from "./types";
import zip from 'lodash/zip';

export async function createDeltaRequest<DictionaryType>(
  decoderDictionaryStore: DecoderDictionaryStore<DictionaryType>,
  imDecoders: Array<ImDecoder<DictionaryType>>,
  eTagger: (DictionaryType) => string,
  request: Request
): Promise<[Request, ETagsToDictionaries<DictionaryType>]> {

  const dictionaries = await decoderDictionaryStore.read(request);

  const eTags = dictionaries.map(eTagger);
  if (dictionaries.length > 0) {
    // TODO don't mutate headers
    request.headers.append("If-None-Accept", eTags.join(", "));

    const ims = imDecoders.map(({ name }) => name);
    request.headers.append("a-im", ims.join(", "));
  }
  return [request, new Map(zip(eTags, dictionaries))];
}
