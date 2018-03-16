import { DecoderDictionaryStore, createDeltaRequest } from "../src";
import jsondiffpatchImDecoder from "../src/jsondiffpatchImDecoder";
import { expect } from "chai";
import { Request } from "node-fetch";

describe("createDeltaRequest", () => {
  it("test", async () => {
    class MockDecoderDictionaryStore implements DecoderDictionaryStore<string> {
      async read(request) {
        expect(await request.text()).to.equal("someBody");
        return ["someDictionary"];
      }
      write() {}
    }

    const mockETagger = () => "someEtag";

    const dictionaryStore = new MockDecoderDictionaryStore();

    const request = new Request("", {
      method: "POST",
      body: "someBody"
    });

    const {
      request: deltaRequest,
      eTagsToDictionaries
    } = await createDeltaRequest(
      dictionaryStore,
      [jsondiffpatchImDecoder],
      mockETagger,
      request
    );

    expect(request.headers.get('a-im')).to.equal('jsondiffpatch');
    expect(eTagsToDictionaries.get('someEtag')).to.equal('someDictionary');
  });
});
