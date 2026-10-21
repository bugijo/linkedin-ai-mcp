import assert from "node:assert/strict";
import { test } from "node:test";
import { Readable } from "node:stream";
import { limitRequestBody } from "./body-limit.js";
import { MAX_BODY_BYTES } from "./http-security.js";

async function collect(chunks: Buffer[]): Promise<Buffer> {
  const parts: Buffer[] = [];
  for await (const chunk of Readable.from(chunks).pipe(limitRequestBody())) {
    parts.push(Buffer.from(chunk));
  }
  return Buffer.concat(parts);
}

test("accepts a request body within limit", async () => {
  const result = await collect([Buffer.alloc(100), Buffer.alloc(200)]);
  assert.equal(result.byteLength, 300);
});

test("accepts the maximum allowed body", async () => {
  const result = await collect([Buffer.alloc(MAX_BODY_BYTES)]);
  assert.equal(result.byteLength, MAX_BODY_BYTES);
});

test("rejects oversized chunked bodies", async () => {
  await assert.rejects(collect([
    Buffer.alloc(MAX_BODY_BYTES - 1),
    Buffer.alloc(2)
  ]), /exceeds maximum size/);
});
