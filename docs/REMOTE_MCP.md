# Remote MCP deployment design (not yet implemented)

## Scope

The existing MCP runs over stdio. ChatGPT's remote connection requires an HTTPS MCP endpoint with a supported transport. Do not expose the stdio server directly to the internet.

## Security boundary

1. Authenticate each MCP client request with a server-side verified credential. Never use an unauthenticated public MCP endpoint.
2. Separate LinkedIn OAuth tokens per user; never use one global token file for multiple remote users.
3. Keep LinkedIn client secrets and token encryption keys in a hosting provider's secrets manager.
4. Validate origin and host, apply request size limits and rate limiting, and log request IDs without tokens.
5. Limit remote tools initially to get_capabilities, draft_post and preview_post. Disable publishing.
6. Require a human-operated approval channel independent of the model before enabling any write action.
7. Provide user logout, token revocation guidance and data deletion.
8. Do not claim the deployment is working until a real ChatGPT connection and MCP handshake have been tested.

## Proposed architecture

ChatGPT / Codex remote client
  -> HTTPS reverse proxy with TLS
  -> authenticated Streamable HTTP MCP endpoint
  -> per-user tool authorization
  -> safe post drafting and review tools
  -> optional LinkedIn OAuth token vault (later)

## Release gates

- CI and tests green
- Authentication and cross-user isolation tests
- Hosting and domain chosen by account owner
- Explicit permission for any deployment costs
- LinkedIn Developer application created and scopes granted
- A live end-to-end connection test

The current implementation is local-only. This document is a deployment specification, not a deployed service.
