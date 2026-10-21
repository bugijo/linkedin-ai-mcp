import assert from "node:assert/strict";
import { test } from "node:test";
import { planContent } from "./content-plan.js";

test("generates only local draft editorial ideas", () => {
  const result = planContent("Automação", 3);
  assert.equal(result.published, false);
  assert.equal(result.ideas.length, 3);
  assert.deepEqual(result.ideas.map((idea) => idea.status), ["draft_only", "draft_only", "draft_only"]);
  assert.equal(result.ideas[0].day, 1);
});

test("rejects invalid editorial requests", () => {
  assert.throws(() => planContent(""));
  assert.throws(() => planContent("A", 0));
  assert.throws(() => planContent("A", 6));
  assert.throws(() => planContent("A", 1.5));
});
