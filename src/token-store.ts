import { mkdir, open, readFile, rename, rm, chmod } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type LinkedInToken = { access_token: string; expires_at: number; scope?: string };
export const tokenPath = join(homedir(), ".config", "linkedin-ai-mcp", "token.json");

export async function saveToken(token: LinkedInToken, path = tokenPath): Promise<void> {
  if (!token.access_token || !Number.isFinite(token.expires_at) || token.expires_at <= Date.now()) {
    throw new Error("Token inválido");
  }
  const directory = dirname(path);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  const temporary = join(directory, ".token-" + randomBytes(12).toString("hex"));
  try {
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(JSON.stringify(token), "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, path);
    await chmod(path, 0o600);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function loadToken(path = tokenPath): Promise<LinkedInToken> {
  const token = JSON.parse(await readFile(path, "utf8")) as LinkedInToken;
  if (!token.access_token || !Number.isFinite(token.expires_at) || Date.now() >= token.expires_at - 60_000) {
    throw new Error("Token ausente ou expirado. Execute npm run auth.");
  }
  return token;
}
