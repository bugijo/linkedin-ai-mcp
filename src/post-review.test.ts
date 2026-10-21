import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewPost } from "./post-review.js";

test("reviews a local post without publishing", () => {
  const result = reviewPost("  Olá LinkedIn!  ");
  assert.equal(result.text, "Olá LinkedIn!");
  assert.equal(result.published, false);
  assert.equal(result.characters, 13);
});

test("rejects empty or oversized posts", () => {
  assert.throws(() => reviewPost("  "));
  assert.throws(() => reviewPost("a".repeat(3001)));
});

test("warns about links and excessive hashtags", () => {
  const result = reviewPost("Confira https://example.com #a #b #c #d #e #f");
  assert.equal(result.warnings.length, 2);
});

test("counts Unicode characters instead of UTF-16 code units", () => {
  const result = reviewPost("🙂".repeat(2000));
  assert.equal(result.characters, 2000);
  assert.throws(() => reviewPost("🙂".repeat(3001)));
});
