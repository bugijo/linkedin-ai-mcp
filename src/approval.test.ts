import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeApprovedPost, previewPost } from "./approval.js";

test("preview and one-time confirmation", () => {
  const item = previewPost("Example");
  assert.equal(item.preview, "Example");
  assert.equal(consumeApprovedPost(item.approvalCode), "Example");
  assert.throws(() => consumeApprovedPost(item.approvalCode));
});

test("invalid approval rejected", () => {
  previewPost("Example");
  assert.throws(() => consumeApprovedPost("wrong"));
});

test("empty text rejected", () => {
  assert.throws(() => previewPost(" "));
});
