# HTTP MCP prototype

The HTTP entrypoint is **experimental**, **single-operator**, and **local-only**. It is not a public hosted MCP service and does not connect to LinkedIn.

## Start

After `npm install && npm run build`, generate a random token outside the repository and set it in your local environment:

```bash
export MCP_BEARER_TOKEN="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))')"
npm run start:http
```

The service binds to `127.0.0.1:3000` by default. The only endpoint is `POST /mcp` with `Authorization: Bearer <token>`. It uses the MCP Streamable HTTP transport with JSON responses and no persistent sessions.

Do not commit, paste or share the bearer token. Do not set up port forwarding or expose this prototype publicly. A production release requires TLS, verified client identity, robust body size enforcement (including chunked requests), rate limiting, request origin/host validation, a deployment-specific authentication strategy, and end-to-end tests.

## Tools

- `get_capabilities`: describes the safe tools
- `draft_post`: creates a local draft outline
- `preview_post`: reviews text and warnings

No LinkedIn tokens are loaded by this server. Publishing is not supported.

## Verification checklist

- Install dependencies and compile
- Test unauthorized request: HTTP 401
- Test invalid method: HTTP 405
- Test MCP initialize and tools/list over authorized POST
- Confirm no publishing tools appear in tools/list
- Test oversized and chunked request handling before any external deployment

Do not claim a successful ChatGPT connection until it has been tested with a supported remote client.

## Current hardening work

The authorization, browser origin, and declared Content-Length checks have isolated unit tests. A bounded JSON request reader now checks the actual body size before forwarding to the MCP transport, including chunked requests. Unit tests cover the reader, and the standalone streaming limiter is retained for comparison. Host validation is implemented with unit tests. A local in-memory fixed-window rate limiter now allows 60 requests per minute per source address. **End-to-end HTTP integration tests, production-grade distributed rate limiting and deployment authentication are still required.** Do not expose this prototype to the public internet.
