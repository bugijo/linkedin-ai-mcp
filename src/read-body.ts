import type { IncomingMessage } from "node:http";
import { MAX_BODY_BYTES } from "./http-security.js";

export class BodyReadError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
  }
}

export async function readLimitedJsonBody(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers["content-type"] ?? "";
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
    throw new BodyReadError("Content-Type must be application/json", 415);
  }
  const chunks: Buffer[] = [];
  let bytes = 0;
  try {
    for await (const chunk of req) {
      const data = Buffer.from(chunk as Buffer);
      bytes += data.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        throw new BodyReadError("Request body too large", 413);
      }
      chunks.push(data);
    }
  } catch (error) {
    if (error instanceof BodyReadError) throw error;
    throw new BodyReadError("Could not read request body", 400);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new BodyReadError("Invalid JSON", 400);
  }
}
