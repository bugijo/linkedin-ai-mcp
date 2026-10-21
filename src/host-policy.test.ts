import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedHost } from "./host-policy.js";

test("accepts local host on configured port", () => {
  assert.equal(isAllowedHost("127.0.0.1:3000", undefined), true);
  assert.equal(isAllowedHost("localhost:4545", undefined, 4545), true);
});

test("rejects remote or malformed host", () => {
  assert.equal(isAllowedHost("example.com", undefined), false);
  assert.equal(isAllowedHost("localhost:3001", undefined), false);
  assert.equal(isAllowedHost(undefined, undefined), false);
  assert.equal(isAllowedHost("localhost:3000,example.com", undefined), false);
});

test("allows only explicitly configured remote host", () => {
  assert.equal(isAllowedHost("mcp.example.com", "mcp.example.com"), true);
  assert.equal(isAllowedHost("evil.example.com", "mcp.example.com"), false);
});
