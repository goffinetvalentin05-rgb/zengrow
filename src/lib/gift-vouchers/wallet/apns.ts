import { createPrivateKey, sign } from "node:crypto";
import { connect, type ClientHttp2Session } from "node:http2";
import { getAppleWalletApnsConfig } from "@/src/lib/gift-vouchers/wallet/config";

const APNS_HOST = "https://api.push.apple.com";
const JWT_TTL_MS = 50 * 60 * 1000;

let cachedJwt: { token: string; expiresAt: number } | null = null;

function createApnsJwt(teamId: string, keyId: string, privateKeyPem: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }),
  ).toString("base64url");
  const unsigned = `${header}.${payload}`;
  const key = createPrivateKey(privateKeyPem);
  const signature = sign("sha256", Buffer.from(unsigned), { key, dsaEncoding: "ieee-p1363" });
  return `${unsigned}.${signature.toString("base64url")}`;
}

function getJwt(): string | null {
  const config = getAppleWalletApnsConfig();
  if (!config) return null;
  if (cachedJwt && cachedJwt.expiresAt > Date.now() + 30_000) return cachedJwt.token;
  const token = createApnsJwt(config.teamIdentifier, config.keyId, config.privateKey);
  cachedJwt = { token, expiresAt: Date.now() + JWT_TTL_MS };
  return token;
}

function sendOnePush(client: ClientHttp2Session, path: string, headers: Record<string, string>): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = client.request({
      ":method": "POST",
      ":path": path,
      ...headers,
    });
    let status = 0;
    req.on("response", (responseHeaders) => {
      status = Number(responseHeaders[":status"] ?? 0);
    });
    req.on("error", reject);
    req.on("end", () => resolve(status));
    req.end("{}");
  });
}

/** Les mises à jour de passes Wallet utilisent toujours l’environnement APNs de production. */
export async function sendAppleWalletPassUpdatePushes(pushTokens: string[]): Promise<void> {
  const config = getAppleWalletApnsConfig();
  const jwt = getJwt();
  if (!config || !jwt || pushTokens.length === 0) return;

  const unique = [...new Set(pushTokens.map((token) => token.trim()).filter(Boolean))];
  const client = connect(APNS_HOST);
  try {
    for (const token of unique) {
      const status = await sendOnePush(client, `/3/device/${token}`, {
        authorization: `bearer ${jwt}`,
        "apns-topic": config.passTypeIdentifier,
        "apns-push-type": "background",
        "apns-priority": "5",
        "content-type": "application/json",
      });
      if (status >= 400) {
        console.error("[gift-vouchers/wallet] APNs status", status);
      }
    }
  } finally {
    client.close();
  }
}
