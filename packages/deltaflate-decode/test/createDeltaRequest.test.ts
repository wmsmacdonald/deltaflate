import { DecoderDictionaryStore, createDeltaRequest } from "../src";
import jsondiffpatchImDecoder from "../src/jsondiffpatchImDecoder";
import { expect } from "chai";
import { Request } from "node-fetch";

describe("createDeltaRequest", () => {
  it("should create delta request with proper headers ", async () => {
    class MockDecoderDictionaryStore implements DecoderDictionaryStore<string> {
      async read(request) {
        expect(await request.text()).to.equal("someBody");
        return ["someDictionary"];
      }
      write() {}
    }

    const mockETagger = dictionary => {
      expect(dictionary).to.equal("someDictionary");
      return "someEtag";
    }

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

    expect(deltaRequest.headers.get('a-im')).to.equal('jsondiffpatch');
    expect(deltaRequest.headers.get('if-none-accept')).to.equal('someEtag');
    expect(eTagsToDictionaries.get('someEtag')).to.equal('someDictionary');
  });
});
