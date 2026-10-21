import assert from "node:assert/strict";
import { test } from "node:test";
import { createAuthorizationRequest, validateOAuthCallback } from "./oauth.js";

test("creates a LinkedIn authorization URL with unique state", () => {
  const config = { clientId: "example-client", redirectUri: "http://localhost:8787/callback" };
  const first = createAuthorizationRequest(config);
  const second = createAuthorizationRequest(config);
  const url = new URL(first.url);
  assert.equal(url.hostname, "www.linkedin.com");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("client_id"), config.clientId);
  assert.match(url.searchParams.get("scope") ?? "", /w_member_social/);
  assert.equal(url.searchParams.get("state"), first.state);
  assert.notEqual(first.state, second.state);
});

test("rejects insecure non-local callback", () => {
  assert.throws(() => createAuthorizationRequest({ clientId: "x", redirectUri: "http://example.com/callback" }));
});

test("rejects missing client ID", () => {
  assert.throws(() => createAuthorizationRequest({ clientId: "", redirectUri: "http://localhost:8787/callback" }));
});

test("requires exact state and authorization code", () => {
  assert.equal(validateOAuthCallback("state123", "state123", "code123"), "code123");
  assert.throws(() => validateOAuthCallback("state123", "wrong", "code123"));
  assert.throws(() => validateOAuthCallback("state123", null, "code123"));
  assert.throws(() => validateOAuthCallback("state123", "state123", null));
});
