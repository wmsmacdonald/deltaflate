
export interface ImEncoder<DictionaryType> {
  name: string;
  encode(dictionary: DictionaryType, body: Buffer): Buffer;
}
