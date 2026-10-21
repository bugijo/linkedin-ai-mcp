import { createServer } from "node:http";
import { isAuthorized, isAllowedOrigin, isValidContentLength } from "./http-security.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createPublicSafeServer } from "./public-safe-server.js";

const secret = process.env.MCP_BEARER_TOKEN;
if (!secret || secret.length < 32) throw new Error("MCP_BEARER_TOKEN must be at least 32 characters");
const port = Number(process.env.PORT ?? "3000");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");

const httpServer = createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.url !== "/mcp") {
    res.writeHead(404).end("Not found");
    return;
  }
  if (!isAuthorized(req.headers.authorization, secret)) {
    res.writeHead(401, { "WWW-Authenticate": "Bearer" }).end("Unauthorized");
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405, { Allow: "POST" }).end("Method not allowed");
    return;
  }
  const origin = req.headers.origin;
  const allowedOrigin = process.env.MCP_ALLOWED_ORIGIN;
  if (!isAllowedOrigin(origin, allowedOrigin)) {
    res.writeHead(403).end("Origin forbidden");
    return;
  }
  if (!isValidContentLength(req.headers["content-length"])) {
    res.writeHead(413).end("Request too large");
    return;
  }
  const server = createPublicSafeServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch {
    if (!res.headersSent) res.writeHead(500).end("Internal error");
  } finally {
    res.on("close", () => { void server.close(); });
  }
});
httpServer.requestTimeout = 15_000;
httpServer.headersTimeout = 10_000;
httpServer.listen(port, "127.0.0.1", () => {
  process.stdout.write("MCP HTTP listening on localhost:" + port + "\n");
});
