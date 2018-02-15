export type ETag = string;

export type ETagsToDictionaries<Dictionary> = Map<ETag, Dictionary>

export interface DecoderDictionaryStore<Dictionary> {
  has(body: BufferSource): Boolean;
  get(body: BufferSource): Array<[ETag, Dictionary]>;
  read(decoded: BufferSource, dictionaryETag?: ETag): BufferSource;
}

export interface ImDecoder<Dictionary> {
  name: string;
  decode(dictionary: Dictionary, body: BufferSource): BufferSource;
}
