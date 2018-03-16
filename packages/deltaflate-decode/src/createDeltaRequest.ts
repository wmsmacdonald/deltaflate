import {
  DecoderDictionaryStore,
  ETagsToDictionaries,
  ImDecoder
} from "./types";
import { zip } from "lodash";

export interface DeltaRequest<DictionaryType> {
  request: Request;
  eTagsToDictionaries: ETagsToDictionaries<DictionaryType>;
}

export async function createDeltaRequest<DictionaryType>(
  decoderDictionaryStore: DecoderDictionaryStore<DictionaryType>,
  imDecoders: Array<ImDecoder<DictionaryType>>,
  eTagger: (DictionaryType) => string,
  request: Request
): Promise<DeltaRequest<DictionaryType>> {
  const dictionaries = await decoderDictionaryStore.read(request);

  const eTags = dictionaries.map(eTagger);
  if (dictionaries.length > 0) {
    // TODO don't mutate headers
    request.headers.append("If-None-Accept", eTags.join(", "));

    const ims = imDecoders.map(({ name }) => name);
    request.headers.append("a-im", ims.join(", "));
  }

  const eTagsToDictionaries: ETagsToDictionaries<DictionaryType> = new Map(
    zip(eTags, dictionaries)
  );

  return {
    request,
    eTagsToDictionaries
  };
}
