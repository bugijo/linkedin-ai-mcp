# Release checklist

This project is experimental. The repository is public; never commit tokens or secrets.

## Technical validation

- [ ] Node 22 clean install and TypeScript build pass
- [ ] Unit tests pass in GitHub Actions
- [ ] Mock API tests cover identity, authorization failures, rate limits, timeouts and 5xx
- [ ] OAuth state, token storage and expiry tested end to end
- [ ] Human approval independent from the language model before publishing
- [ ] Persistent deduplication, audit logs without secrets and posting limits
- [ ] Verify the current supported Linkedin-Version in official documentation

## External setup by account owner

- [ ] Create a LinkedIn Developer application with an associated LinkedIn Page
- [ ] Enable Sign In with LinkedIn using OpenID Connect and Share on LinkedIn
- [ ] Register exact OAuth redirect URL
- [ ] Keep client secret only in a local environment or a secrets manager
- [ ] Approve a single live test post explicitly

## Remote deployment

- [ ] Add authenticated HTTPS Streamable HTTP MCP transport
- [ ] Add per-user authorization, secure storage and revocation
- [ ] Verify compatibility with ChatGPT and Codex
- [ ] Complete security review before merging into main

Do not set LINKEDIN_ENABLE_PUBLISH=true until these checks pass.
