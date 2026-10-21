import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";

test("HTTP server refuses startup without bearer token", () => {
  const env = { ...process.env };
  delete env.MCP_BEARER_TOKEN;
  const result = spawnSync(process.execPath, ["dist/http-server.js"], {
    env,
    encoding: "utf8",
    timeout: 5000
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MCP_BEARER_TOKEN/);
});

test("HTTP server refuses weak bearer token", () => {
  const result = spawnSync(process.execPath, ["dist/http-server.js"], {
    env: { ...process.env, MCP_BEARER_TOKEN: "weak" },
    encoding: "utf8",
    timeout: 5000
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MCP_BEARER_TOKEN/);
});
