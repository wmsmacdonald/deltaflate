import {
  deltaflateEncode,
  incomingMessageToWhatWgRequest,
  writeWhatWgResponse,
  captureServerResponse,
  EncoderDictionaryStore,
  ImEncoder
} from "../../deltaflate-encode/src";
import { IncomingMessage, ServerResponse } from "http";

export function deltaflateExpress<DictionaryType>(
  dictionaryStore: EncoderDictionaryStore<DictionaryType>,
  imEncoders?: Array<ImEncoder<DictionaryType>>
) {
  // return middleware
  return function(incomingMessage: IncomingMessage, res: ServerResponse, next) {
    const whatWgRequest = incomingMessageToWhatWgRequest(incomingMessage);

    captureServerResponse(res)
      .then(deltaflateEncode.bind(null, dictionaryStore, imEncoders, whatWgRequest))
      .then(writeWhatWgResponse.bind(res));

    next();
  };
}
export default deltaflateExpress;
