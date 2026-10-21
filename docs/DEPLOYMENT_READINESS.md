# Deployment readiness checklist

The local HTTP MCP prototype is not a production service. Its bearer token is intended for local development, not as a substitute for an OAuth-based remote connector authorization flow.

## Automated gates
- Run `npm test` (compilation and unit/integration tests).
- Confirm `initialize`, `tools/list`, and `preview_post` work using a real MCP client.
- Verify `tools/list` exposes no publishing tool.
- Check authorization, Host/Origin validation, 64 KiB body limit, and HTTP 429 responses.
- Confirm the server does not load LinkedIn credentials.

## Remote deployment prerequisites
- HTTPS ingress and a provider account with secret management.
- A supported remote MCP authentication flow; never put static bearer secrets in a public repository.
- Persistent or shared rate limiting if deploying multiple replicas.
- Observability without recording access tokens or personal content.
- Explicit confirmation of supported ChatGPT/Codex remote connector requirements.
- Threat model, security review, and repeatable smoke tests against staging.

## LinkedIn publishing prerequisites
- Create a LinkedIn Developer application.
- Request and obtain the required API products and permissions.
- Configure official OAuth redirect URI and encrypted token storage.
- Add explicit human approval for each publish operation.
- Verify publication scope and revocation handling.

Do not deploy or publish until the corresponding prerequisites are met.
