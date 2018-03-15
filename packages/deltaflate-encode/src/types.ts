import { Request, Response } from 'node-fetch';

export interface ImEncoder<DictionaryType> {
  name: string;
  encode(dictionary: DictionaryType, body: Buffer): Buffer;
}

export type ETag = string;

export interface EncoderDictionaryStore<DictionaryType> {
  has(eTag: ETag): Boolean;
  get(eTag: ETag): DictionaryType;
  delete(eTag: ETag): void;
  write(
    request: Request,
    response: Response,
    dictionary?: DictionaryType
  ): void;
  createETag(dictionary: DictionaryType): string;
}
