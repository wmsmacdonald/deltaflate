import { DiffPatcher } from "jsondiffpatch";
import { expect } from "chai";
import { TextEncoder } from "text-encoding";

import jsondiffpatchImDecoder from "../src/jsondiffpatchImDecoder";

const diffPatcher = new DiffPatcher();

describe("jsondiffpatchImDecoder", () => {
  describe("decode", () => {
    it("returns target from dictionary and delta", async () => {
      const dictionary = { a: 1 };
      const target = { a: 2 };
      const delta = diffPatcher.diff(dictionary, target);

      const decoded = jsondiffpatchImDecoder.decode(
        dictionary,
        new TextEncoder().encode(JSON.stringify(delta))
      );

      expect(JSON.parse(Buffer.from(decoded).toString())).to.deep.equal(target);
    });
  });
});
