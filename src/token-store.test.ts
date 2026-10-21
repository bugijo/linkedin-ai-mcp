import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadToken, saveToken } from "./token-store.js";

test("stores and reads an unexpired token locally", async () => {
  const dir = await mkdtemp(join(tmpdir(), "linkedin-mcp-"));
  const file = join(dir, "tokens", "token.json");
  try {
    const token = { access_token: "fake-test-token", expires_at: Date.now() + 3600000 };
    await saveToken(token, file);
    assert.deepEqual(await loadToken(file), token);
    assert.equal((await stat(file)).mode & 0o777, 0o600);
    assert.equal((await stat(join(dir, "tokens"))).mode & 0o777, 0o700);
    assert.equal(JSON.parse(await readFile(file, "utf8")).access_token, "fake-test-token");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("rejects expired tokens", async () => {
  const dir = await mkdtemp(join(tmpdir(), "linkedin-mcp-"));
  try {
    const file = join(dir, "token.json");
    await assert.rejects(saveToken({ access_token: "fake", expires_at: Date.now() - 1000 }, file));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
