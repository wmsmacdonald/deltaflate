import { Request, Response } from "node-fetch";
import { ServerResponse, IncomingMessage } from "http";

// working with Node http.ServerResponse and http.IncomingMessage

export async function writeWhatWgResponse(
  whatWgResponse: Response,
  serverResponse: ServerResponse
): Promise<void> {
  const body = await whatWgResponse.buffer();

  serverResponse.writeHead(
    whatWgResponse.status,
    whatWgResponse.statusText,
    // TODO fix Header type definition
    (whatWgResponse.headers as any).raw()
  );
  serverResponse.end(body);
}

export function httpIncomingMessageToWhatWgRequest(
  incomingMessage: IncomingMessage
): Request {
  return new Request(incomingMessage.url, {
    method: incomingMessage.method,
    headers: incomingMessage.headers as { [index: string]: string }
  });
}

export async function captureServerResponse(serverResponse: ServerResponse) {
  return new Promise(resolve => {
    const buffers: Array<Buffer> = [];

    const write = serverResponse.write.bind(serverResponse);
    const end = serverResponse.end.bind(serverResponse);

    function captureWrite(
      chunk: Buffer | string,
      arg2: string | (() => void) = () => {},
      arg3: (() => void) = () => {}
    ): Boolean {
      if (typeof chunk === "string") {
        buffers.push(Buffer.from(chunk, arg2 as string));
        arg3();
      } else {
        buffers.push(chunk);
        (arg2 as () => void)();
      }
      return true;
    }

    function captureEnd(
      data?: string | Buffer,
      arg2: string | (() => void) = () => {},
      arg3: (() => void) = () => {}
    ) {
      if (typeof data === "string" || data instanceof Buffer) {
        captureWrite(data, arg2, arg3);
      }

      const finalBuffer = Buffer.concat(buffers);

      // restore write and end methods so actual response can be written
      serverResponse.write = write.bind(serverResponse);
      serverResponse.end = end.bind(serverResponse);
      resolve(finalBuffer);
    }

    // override
    serverResponse.write = captureWrite.bind(serverResponse);
    // override
    serverResponse.end = captureEnd.bind(serverResponse);
  });
}
