import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type PendingPost = { text: string; codeHash: string; expiresAt: number };
let pending: PendingPost | undefined;

export function previewPost(text: string): { preview: string; approvalCode: string; expiresAt: string } {
  if (!text.trim() || text.length > 3000) throw new Error("Texto inválido (1 a 3000 caracteres)");
  const approvalCode = randomBytes(12).toString("hex");
  pending = { text, codeHash: createHash("sha256").update(approvalCode).digest("hex"), expiresAt: Date.now() + 5 * 60_000 };
  return { preview: text, approvalCode, expiresAt: new Date(pending.expiresAt).toISOString() };
}

export function consumeApprovedPost(code: string): string {
  const current = pending;
  pending = undefined;
  if (!current || Date.now() > current.expiresAt || !/^[a-f0-9]{24}$/.test(code)) throw new Error("Aprovação ausente ou expirada");
  const candidate = createHash("sha256").update(code).digest("hex");
  if (!timingSafeEqual(Buffer.from(candidate), Buffer.from(current.codeHash))) throw new Error("Código de aprovação incorreto");
  return current.text;
}
