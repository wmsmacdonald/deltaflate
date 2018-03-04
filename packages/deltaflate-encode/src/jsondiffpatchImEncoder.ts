import { ImEncoder } from './types';

import { DiffPatcher } from 'jsondiffpatch';

export type Serializable = any;

const diffPatcher = new DiffPatcher();

export const jsondiffpatchImEncoder: ImEncoder<Serializable> = {
  name: 'jsondiffpatch',
  encode(dictionary: Serializable, body: Buffer) {
    const target = JSON.parse(body.toString());
    const delta = diffPatcher.diff(dictionary, target); 
    return new Buffer(JSON.stringify(delta));
  }
}
export default jsondiffpatchImEncoder;
