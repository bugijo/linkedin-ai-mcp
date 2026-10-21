import { isAllowedOrigin } from "./http-security.js";

export function isAllowedHost(host: string | undefined, configured: string | undefined, port = 3000): boolean {
  if (!host || host.includes(",") || /[\s/@]/.test(host)) return false;
  if (configured) return host.toLowerCase() === configured.toLowerCase();
  return host === "127.0.0.1:" + port || host === "localhost:" + port;
}

export function isAllowedBrowserRequest(origin: string | undefined, allowedOrigin: string | undefined): boolean {
  return isAllowedOrigin(origin, allowedOrigin);
}
