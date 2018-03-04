import { DiffPatcher } from 'jsondiffpatch';
import { ImDecoder } from './types';

export type Seriazable = any;

const diffPatcher = new DiffPatcher();

export const jsondiffpatchImDecoder: ImDecoder<Seriazable> = {
  name: 'jsondiffpatch',
  decode(dictionary: Seriazable, body: BufferSource): BufferSource {
    const delta = JSON.parse(body.toString());
    const target = diffPatcher.patch(dictionary, delta);
    return new Buffer(target);
  }
}
export default jsondiffpatchImDecoder;