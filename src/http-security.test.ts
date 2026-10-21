import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedOrigin, isAuthorized, isValidContentLength, MAX_BODY_BYTES } from "./http-security.js";

test("requires exact bearer authorization", () => {
  const secret = "s".repeat(32);
  assert.equal(isAuthorized("Bearer " + secret, secret), true);
  assert.equal(isAuthorized(undefined, secret), false);
  assert.equal(isAuthorized("Bearer " + secret + "x", secret), false);
  assert.equal(isAuthorized("Basic " + secret, secret), false);
  assert.equal(isAuthorized("Bearer " + "x".repeat(32), secret), false);
});

test("only accepts explicitly configured browser origins", () => {
  assert.equal(isAllowedOrigin(undefined, undefined), true);
  assert.equal(isAllowedOrigin("https://example.org", undefined), false);
  assert.equal(isAllowedOrigin("https://example.org", "https://example.org"), true);
  assert.equal(isAllowedOrigin("https://attacker.org", "https://example.org"), false);
});

test("validates declared body sizes", () => {
  assert.equal(isValidContentLength(undefined), true);
  assert.equal(isValidContentLength(String(MAX_BODY_BYTES)), true);
  assert.equal(isValidContentLength(String(MAX_BODY_BYTES + 1)), false);
  assert.equal(isValidContentLength("-1"), false);
  assert.equal(isValidContentLength("abc"), false);
});
