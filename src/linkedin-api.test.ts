import assert from "node:assert/strict";
import { test } from "node:test";
import { publishTextPost } from "./linkedin-api.js";

test("rejects empty text before making a request", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("unexpected network"); };
  try {
    await assert.rejects(publishTextPost(" ", "fake-token"));
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test("does not publish if identity endpoint fails", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(null, { status: 401 });
  };
  try {
    await assert.rejects(publishTextPost("Test post", "fake-token"), /identity HTTP 401/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("submits the expected REST post payload with a mock identity", async () => {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (calls.length === 1) {
      return new Response(JSON.stringify({ sub: "mock123" }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:mock" } });
  };
  try {
    const result = await publishTextPost("Example", "fake-token");
    assert.equal(result.status, 201);
    assert.equal(result.id, "urn:li:share:mock");
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url, "https://api.linkedin.com/rest/posts");
    const payload = JSON.parse(String(calls[1].init?.body));
    assert.equal(payload.author, "urn:li:person:mock123");
    assert.equal(payload.commentary, "Example");
  } finally {
    globalThis.fetch = original;
  }
});
