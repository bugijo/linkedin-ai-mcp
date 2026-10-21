import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { test } from "node:test";
import assert from "node:assert/strict";

async function availablePort(): Promise<number> {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const address = listener.address();
  if (!address || typeof address === "string") throw new Error("No port");
  await new Promise<void>((resolve) => listener.close(() => resolve()));
  return address.port;
}

test("HTTP MCP rejects unauthorized and invalid requests", { timeout: 15000 }, async () => {
  const port = await availablePort();
  const token = "test-only-token-".padEnd(40, "x");
  const child = spawn(process.execPath, ["dist/http-server.js"], {
    env: { ...process.env, PORT: String(port), MCP_BEARER_TOKEN: token },
    stdio: ["ignore", "pipe", "pipe"]
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error("HTTP server exited unexpectedly");
      try {
        const response = await fetch("http://127.0.0.1:" + port + "/mcp", { method: "GET" });
        if (response.status === 401) { ready = true; break; }
      } catch { /* waiting for local listener */ }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.equal(ready, true, "HTTP server did not start");
    const url = "http://127.0.0.1:" + port + "/mcp";
    const headers = { Authorization: "Bearer " + token };
    const unauthorized = await fetch(url, { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } });
    assert.equal(unauthorized.status, 401);
    const invalidMethod = await fetch(url, { method: "GET", headers });
    assert.equal(invalidMethod.status, 405);
    const invalidJson = await fetch(url, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: "{" });
    assert.equal(invalidJson.status, 400);
    const initialize = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "integration-test", version: "1.0" } }
      })
    });
    assert.equal(initialize.status, 200);
    const initialized = await initialize.json() as { result?: { serverInfo?: { name?: string } } };
    assert.equal(initialized.result?.serverInfo?.name, "linkedin-ai-mcp");
    const listed = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
    });
    assert.equal(listed.status, 200);
    const toolsResponse = await listed.json() as { result?: { tools?: Array<{ name: string }> } };
    assert.deepEqual(toolsResponse.result?.tools?.map((tool) => tool.name).sort(),
      ["draft_post", "get_capabilities", "plan_content", "preview_post"]);
    const preview = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 3, method: "tools/call",
        params: { name: "preview_post", arguments: { text: "Teste local" } }
      })
    });
    assert.equal(preview.status, 200);
    const previewPayload = await preview.json() as { result?: { content?: Array<{ text?: string }> } };
    const review = JSON.parse(previewPayload.result?.content?.[0]?.text ?? "{}") as { published?: boolean; text?: string };
    assert.equal(review.published, false);
    assert.equal(review.text, "Teste local");
    const planned = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/call",
        params: { name: "plan_content", arguments: { topic: "Automação", count: 2 } } })
    });
    assert.equal(planned.status, 200);
    const planResponse = await planned.json() as { result?: { content?: Array<{ text?: string }> } };
    const plan = JSON.parse(planResponse.result?.content?.[0]?.text ?? "{}") as { published?: boolean; ideas?: unknown[] };
    assert.equal(plan.published, false);
    assert.equal(plan.ideas?.length, 2);
    const oversized = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ data: "x".repeat(70 * 1024) })
    });
    assert.equal(oversized.status, 413);
    const deniedHost = await fetch(url, {
      method: "POST",
      headers: { ...headers, Host: "unexpected.example", "Content-Type": "application/json" },
      body: "{}"
    });
    assert.equal(deniedHost.status, 403);
    const invalidOrigin = await fetch(url, { method: "POST", headers: { ...headers, "Content-Type": "application/json", Origin: "https://untrusted.example" }, body: "{}" });
    assert.equal(invalidOrigin.status, 403);
    let rateLimited = false;
    for (let attempt = 0; attempt < 70; attempt++) {
      const response = await fetch(url, { method: "GET", headers });
      if (response.status === 429) {
        assert.ok(Number(response.headers.get("retry-after")) >= 1);
        rateLimited = true;
        break;
      }
    }
    assert.equal(rateLimited, true, "Expected rate limiting after repeated requests");
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 1500))]);
    }
  }
});
