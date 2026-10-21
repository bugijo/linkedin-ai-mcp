import assert from "node:assert/strict";
import { test } from "node:test";
import { Readable } from "node:stream";
import { readLimitedJsonBody, BodyReadError } from "./read-body.js";
import { MAX_BODY_BYTES } from "./http-security.js";
import type { IncomingMessage } from "node:http";

function mockRequest(parts: string[], contentType = "application/json"): IncomingMessage {
  const source = Readable.from(parts);
  Object.assign(source, { headers: { "content-type": contentType } });
  return source as unknown as IncomingMessage;
}

test("parses a JSON body sent in chunks", async () => {
  const result = await readLimitedJsonBody(mockRequest(['{"jsonrpc":', '"2.0"}']));
  assert.deepEqual(result, { jsonrpc: "2.0" });
});

test("rejects oversized chunked JSON before parsing", async () => {
  await assert.rejects(
    readLimitedJsonBody(mockRequest(['{"x":"', "a".repeat(MAX_BODY_BYTES), '"}'])),
    (error: unknown) => error instanceof BodyReadError && error.statusCode === 413
  );
});

test("rejects invalid JSON and unsupported media types", async () => {
  await assert.rejects(
    readLimitedJsonBody(mockRequest(["{"])),
    (error: unknown) => error instanceof BodyReadError && error.statusCode === 400
  );
  await assert.rejects(
    readLimitedJsonBody(mockRequest(["{}"], "text/plain")),
    (error: unknown) => error instanceof BodyReadError && error.statusCode === 415
  );
});
