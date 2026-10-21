import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type LinkedInToken = { access_token: string; expires_at: number; scope?: string };
export const tokenPath = join(homedir(), ".config", "linkedin-ai-mcp", "token.json");

export async function saveToken(token: LinkedInToken, path = tokenPath): Promise<void> {
  if (!token.access_token || !Number.isFinite(token.expires_at)) throw new Error("Token inválido");
  await mkdir(join(path, ".."), { recursive: true, mode: 0o700 });
  await writeFile(path, JSON.stringify(token), { encoding: "utf8", mode: 0o600, flag: "w" });
  await chmod(path, 0o600);
}

export async function loadToken(path = tokenPath): Promise<LinkedInToken> {
  const token = JSON.parse(await readFile(path, "utf8")) as LinkedInToken;
  if (!token.access_token || !Number.isFinite(token.expires_at) || Date.now() >= token.expires_at - 60_000) {
    throw new Error("Token ausente ou expirado. Execute npm run auth.");
  }
  return token;
}
