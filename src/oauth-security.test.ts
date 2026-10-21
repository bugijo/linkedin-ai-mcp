import assert from "node:assert/strict";
import { test } from "node:test";
import { createAuthorizationRequest, validateOAuthCallback } from "./oauth.js";

test("OAuth state is unique", () => {
  const config = { clientId: "test", redirectUri: "http://localhost:8787/callback" };
  const a = createAuthorizationRequest(config);
  const b = createAuthorizationRequest(config);
  assert.notEqual(a.state, b.state);
  assert.equal(new URL(a.url).searchParams.get("state"), a.state);
});

test("OAuth state must match", () => {
  assert.equal(validateOAuthCallback("abc", "abc", "code"), "code");
  assert.throws(() => validateOAuthCallback("abc", "abd", "code"));
  assert.throws(() => validateOAuthCallback("abc", null, "code"));
});

test("invalid redirect is rejected", () => {
  assert.throws(() => createAuthorizationRequest({ clientId: "test", redirectUri: "http://example.org/callback" }));
});
