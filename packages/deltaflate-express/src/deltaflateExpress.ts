import {
  deltaflateEncode,
  EncoderDictionaryStore,
  ImEncoder
} from "../../deltaflate-encode/src";
import { IncomingMessage, ServerResponse } from "http";
import { incomingMessageToWhatWgRequest, writeWhatWgResponse, interceptResponse } from 'intercept-response';

export function deltaflateExpress<DictionaryType>(
  dictionaryStore: EncoderDictionaryStore<DictionaryType>,
  imEncoders?: Array<ImEncoder<DictionaryType>>
) {
  // return middleware
  return function(incomingMessage: IncomingMessage, res: ServerResponse, next) {
    const whatWgRequest = incomingMessageToWhatWgRequest(incomingMessage);

    interceptResponse(res)
      .then(whatWgResponse => deltaflateEncode(
          dictionaryStore,
          imEncoders,
          whatWgRequest.clone(),
          whatWgResponse
        )
      )
      .then(deltaResponse => writeWhatWgResponse(res, deltaResponse));

    next();
  };
}
export default deltaflateExpress;
