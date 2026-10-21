import { createServer } from "node:http";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createAuthorizationRequest, LINKEDIN_TOKEN_ENDPOINT, validateOAuthCallback } from "./oauth.js";
import { saveToken } from "./token-store.js";

async function main(): Promise<void> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI ?? "http://localhost:8787/callback";
  if (!clientId || !clientSecret) throw new Error("Configure LINKEDIN_CLIENT_ID e LINKEDIN_CLIENT_SECRET em variáveis de ambiente.");
  const redirect = new URL(redirectUri);
  if (redirect.protocol !== "http:" || redirect.hostname !== "localhost" || redirect.pathname !== "/callback") {
    throw new Error("Autenticação CLI requer http://localhost:<porta>/callback");
  }
  const { url, state } = createAuthorizationRequest({ clientId, redirectUri });
  const port = Number(redirect.port || 80);
  let completed = false;
  const server = createServer(async (req, res) => {
    const requestUrl = new URL(req.url ?? "/", redirectUri);
    if (requestUrl.pathname !== "/callback" || completed) { res.writeHead(404).end(); return; }
    completed = true;
    try {
      const error = requestUrl.searchParams.get("error");
      if (error) throw new Error("LinkedIn recusou a autorização: " + error);
      const code = validateOAuthCallback(state, requestUrl.searchParams.get("state"), requestUrl.searchParams.get("code"));
      const body = new URLSearchParams({
        grant_type: "authorization_code", code, redirect_uri: redirectUri,
        client_id: clientId, client_secret: clientSecret,
      });
      const response = await fetch(LINKEDIN_TOKEN_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body,
      });
      if (!response.ok) throw new Error("Falha ao obter token LinkedIn: HTTP " + response.status);
      const token = (await response.json()) as { access_token?: string; expires_in?: number; scope?: string };
      if (!token.access_token || !token.expires_in) throw new Error("Resposta de token inválida");
      await saveToken({ access_token: token.access_token, expires_at: Date.now() + token.expires_in * 1000, scope: token.scope });
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("LinkedIn conectado. Pode fechar esta janela.");
      stdout.write("Token salvo localmente com permissões restritas.\n");
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Autorização falhou. Veja o terminal.");
      process.stderr.write((error instanceof Error ? error.message : "Erro de autenticação") + "\n");
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
  server.listen(port, "localhost", () => {
    stdout.write("Abra este endereço no navegador para autorizar o LinkedIn:\n" + url + "\n");
  });
  const timeout = setTimeout(() => { server.close(); process.stderr.write("Tempo limite de autenticação excedido.\n"); }, 5 * 60_000);
  server.on("close", () => clearTimeout(timeout));
}

main().catch((error) => { process.stderr.write((error as Error).message + "\n"); process.exitCode = 1; });
