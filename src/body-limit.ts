import { Transform } from "node:stream";
import { MAX_BODY_BYTES } from "./http-security.js";

/**
 * Rejects oversized request bodies even when Content-Length is missing
 * (for example with Transfer-Encoding: chunked).
 */
export function limitRequestBody(): Transform {
  let bytes = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      bytes += chunk.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        callback(new Error("Request body exceeds maximum size"));
        return;
      }
      callback(null, chunk);
    }
  });
}
