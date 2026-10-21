import assert from "node:assert/strict";
import { test } from "node:test";
import { FixedWindowRateLimiter } from "./rate-limit.js";

test("allows requests up to configured window quota", () => {
  const limiter = new FixedWindowRateLimiter(2, 1000, () => 0);
  assert.equal(limiter.check("client").allowed, true);
  assert.equal(limiter.check("client").allowed, true);
  assert.deepEqual(limiter.check("client"), { allowed: false, retryAfterSeconds: 1 });
});

test("resets quota after window expires", () => {
  let now = 0;
  const limiter = new FixedWindowRateLimiter(1, 1000, () => now);
  limiter.check("client");
  now = 1000;
  assert.equal(limiter.check("client").allowed, true);
});

test("separates client quotas", () => {
  const limiter = new FixedWindowRateLimiter(1, 1000, () => 0);
  limiter.check("a");
  assert.equal(limiter.check("a").allowed, false);
  assert.equal(limiter.check("b").allowed, true);
});

test("rejects invalid configuration", () => {
  assert.throws(() => new FixedWindowRateLimiter(0));
  assert.throws(() => new FixedWindowRateLimiter(10, 0));
});
