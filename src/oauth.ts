import { randomBytes, timingSafeEqual } from "node:crypto";

export const LINKEDIN_AUTH_ENDPOINT = "https://www.linkedin.com/oauth/v2/authorization";
export const LINKEDIN_TOKEN_ENDPOINT = "https://www.linkedin.com/oauth/v2/accessToken";
export const DEFAULT_SCOPES = ["openid", "profile", "email", "w_member_social"] as const;

export type OAuthConfig = {
  clientId: string;
  redirectUri: string;
  scopes?: readonly string[];
};

export function createAuthorizationRequest(config: OAuthConfig): { url: string; state: string } {
  if (!config.clientId.trim()) throw new Error("LinkedIn client ID ausente");
  const redirect = new URL(config.redirectUri);
  if (redirect.protocol !== "https:" && !(redirect.protocol === "http:" && redirect.hostname === "localhost")) {
    throw new Error("Redirect URI deve usar HTTPS ou http://localhost");
  }
  if (redirect.username || redirect.password || redirect.hash) throw new Error("Redirect URI inválida");
  const scopes = config.scopes ?? DEFAULT_SCOPES;
  if (!scopes.length || scopes.some((scope) => !/^[a-z_]+$/.test(scope))) throw new Error("Escopos inválidos");
  const state = randomBytes(32).toString("base64url");
  const url = new URL(LINKEDIN_AUTH_ENDPOINT);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirect.toString());
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scopes.join(" "));
  return { url: url.toString(), state };
}

export function validateOAuthCallback(expectedState: string, receivedState: string | null, code: string | null): string {
  if (!expectedState || !receivedState) throw new Error("OAuth state inválido");
  const a = Buffer.from(expectedState);
  const b = Buffer.from(receivedState);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("OAuth state inválido");
  if (!code || !code.trim()) throw new Error("Código de autorização ausente");
  return code;
}
