# LinkedIn Developer setup — actions for the account owner

The MCP currently works only as a draft/preview prototype. Do not send credentials, OAuth codes, access tokens, or screenshots showing secrets to chat or GitHub.

1. Open https://www.linkedin.com/developers/apps and sign in to your LinkedIn account.
2. Select **Create app**. Enter an app name, associate a LinkedIn Page if the portal requires one, and provide the requested branding and legal information. The exact requirements depend on LinkedIn's current portal.
3. In the app's **Products** section, request the products needed for **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn** if available. Approval and scopes are subject to LinkedIn policies.
4. In **Auth**, register the local redirect URL exactly as `http://localhost:8787/callback` if the portal permits this URL. Do not change it silently; OAuth redirect URLs must match exactly.
5. Keep the **Client ID** and **Client Secret** private. Do not add them to GitHub files or issues.
6. Once approved, run the local authentication CLI using environment variables on your own trusted machine, following the README. A later remote OAuth flow will require its own HTTPS redirect and separate design.

**Safe progress report to share:** app created (yes/no), required products approved (yes/no), redirect URL accepted (yes/no). Do not share the secret.

Publishing remains disabled in the MCP even after the app is created. A separate explicit per-post approval workflow must be implemented and verified before publishing can be enabled.
