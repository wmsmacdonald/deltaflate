import { DiffPatcher } from 'jsondiffpatch';
import { TextDecoder, TextEncoder } from 'text-encoding';
import 'text-encoding';
import { ImDecoder } from './types';

export type Seriazable = any;

const diffPatcher = new DiffPatcher();

export const jsondiffpatchImDecoder: ImDecoder<Seriazable> = {
  name: 'jsondiffpatch',
  decode(dictionary: Seriazable, body: BufferSource): ArrayBuffer {
    const delta = JSON.parse(new TextDecoder().decode(body));
    const target = diffPatcher.patch(dictionary, delta);
    return new TextEncoder().encode(JSON.stringify(target)).buffer;
  }
}
export default jsondiffpatchImDecoder;