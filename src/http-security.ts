import { timingSafeEqual } from "node:crypto";

export const MAX_BODY_BYTES = 64 * 1024;

export function isAuthorized(header: string | undefined, secret: string): boolean {
  const expected = Buffer.from("Bearer " + secret);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isAllowedOrigin(origin: string | undefined, allowed: string | undefined): boolean {
  return !origin || (!!allowed && origin === allowed);
}

export function isValidContentLength(value: string | undefined): boolean {
  if (value === undefined) return true;
  if (!/^(0|[1-9][0-9]*)$/.test(value)) return false;
  return Number(value) <= MAX_BODY_BYTES;
}
