# MCP staging smoke test

Run against a **local-only** HTTP MCP instance. No LinkedIn account or publishing permission is required.

```bash
npm install
npm test
export MCP_BEARER_TOKEN="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))')"
npm run start:http
```

In a second terminal, check that the endpoint requires authorization:

```bash
curl -i http://127.0.0.1:3000/mcp
```

Expected: HTTP 401. Do not paste the token into chat, logs, issues or commit history.

The automated `src/http-server.test.ts` test additionally exercises initialize, tools/list, preview_post, invalid JSON, Host/Origin checks, request size limits and throttling. It must pass in CI before merging.

## Release gates

1. CI build and tests pass on the PR head commit.
2. Local MCP client successfully negotiates protocol and invokes a read-only tool.
3. Security review confirms no LinkedIn token loading or publication route in the public-safe server.
4. Remote auth design is reviewed separately; static bearer auth is **not** sufficient for an internet-exposed ChatGPT connector.
5. Deployment credentials and HTTPS hosting are configured only after authorization by the account owner.

No public deployment should be attempted based on this document alone.
