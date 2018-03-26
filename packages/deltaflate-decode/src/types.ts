export type ETag = string;

export type ETagsToDictionaries<Dictionary> = Map<ETag, Dictionary>

export interface DecoderDictionaryStore<TDictionary> {
  read(request: Request): Promise<Array<TDictionary | void>>;
  write(response: Response, dictionaryETag?: ETag) : void;
}

export interface ImDecoder<Dictionary> {
  name: string;
  decode(dictionary: Dictionary, body: ArrayBuffer): ArrayBuffer;
}
