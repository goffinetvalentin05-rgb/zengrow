import { createHash, randomBytes } from "node:crypto";

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiToken() {
  const raw = `lg_${randomBytes(24).toString("base64url")}`;
  return {
    raw,
    tokenHash: hashToken(raw),
    prefix: raw.slice(0, 10),
  };
}

export function readBearer(header: string | null) {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token?.startsWith("lg_")) return null;
  return token;
}
