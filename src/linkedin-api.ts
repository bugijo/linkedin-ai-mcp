import { loadToken } from "./token-store.js";

const API = "https://api.linkedin.com/rest/posts";
const VERSION = process.env.LINKEDIN_API_VERSION ?? "202609";

export type PublishResult = { id: string | null; status: number };

export async function publishTextPost(text: string, token?: string): Promise<PublishResult> {
  if (!text.trim() || text.length > 3000) throw new Error("Texto inválido (1 a 3000 caracteres)");
  if (!/^20[0-9]{4}$/.test(VERSION)) throw new Error("LINKEDIN_API_VERSION deve ser YYYYMM");
  const accessToken = token ?? (await loadToken()).access_token;
  const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileResponse.ok) throw new Error(`LinkedIn identity HTTP ${profileResponse.status}`);
  const identity = (await profileResponse.json()) as { sub?: string };
  if (!identity.sub || !/^[A-Za-z0-9_-]+$/.test(identity.sub)) throw new Error("Identidade LinkedIn inválida");
  const response = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Linkedin-Version": VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${identity.sub}`,
      commentary: text,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!response.ok) throw new Error(`LinkedIn publish HTTP ${response.status}`);
  if (response.status !== 201) throw new Error(`Resposta de publicação inesperada: HTTP ${response.status}`);
  return { id: response.headers.get("x-restli-id"), status: response.status };
}
