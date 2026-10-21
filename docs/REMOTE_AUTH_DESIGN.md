# Remote MCP authentication design (not implemented)

The current HTTP entrypoint is intentionally bound to loopback. Do not change the bind address to 0.0.0.0 or enable public ingress merely to connect ChatGPT.

## Separation of credentials

- **MCP client authentication** proves which ChatGPT/Codex user may invoke the server.
- **LinkedIn OAuth** independently authorizes access to a LinkedIn account.
- These tokens must not be interchangeable, logged, stored in the repository, or exposed in tool responses.

## Required remote design

1. Use HTTPS and a trusted deployment identity/provider.
2. Provide an OAuth-compatible MCP authorization server or supported trusted identity integration, including client registration as required by the selected MCP client.
3. Verify access token issuer, audience, expiration, signature, and permitted scopes on every request.
4. Bind user sessions to a tenant identity and isolate encrypted LinkedIn refresh tokens per account.
5. Validate Host/Origin and request limits behind a trusted reverse proxy; do not trust arbitrary forwarded headers.
6. Keep the remote tool allowlist read-only/draft-only until LinkedIn authorization and explicit per-post human approval are implemented.
7. Record only non-sensitive audit metadata. Provide logout and token revocation.
8. Exercise a full end-to-end connection from the intended ChatGPT/Codex client in staging before production.

## Unresolved prerequisites

- Selection of cloud host and its secret management.
- Confirmation of current remote MCP connector authentication requirements.
- LinkedIn Developer application, product access, scopes, and redirect URIs.

**Status:** design notes only; remote OAuth is not yet implemented and no service is hosted.
