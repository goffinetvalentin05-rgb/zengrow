import { APPLE_WWDR_G4_PEM } from "@/src/lib/gift-vouchers/wallet/wwdr";

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function normalizePem(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes("BEGIN ")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8").trim();
    if (decoded.includes("BEGIN ")) return decoded.replace(/\\n/g, "\n");
  } catch {
    /* ignore */
  }
  return trimmed.replace(/\\n/g, "\n");
}

export type AppleWalletSigningConfig = {
  passTypeIdentifier: string;
  teamIdentifier: string;
  signerCert: string;
  signerKey: string;
  signerKeyPassphrase: string;
  wwdr: string;
};

export type AppleWalletApnsConfig = {
  teamIdentifier: string;
  keyId: string;
  privateKey: string;
  passTypeIdentifier: string;
};

export function getAppleWalletPassTypeIdentifier(): string {
  return readEnv("APPLE_WALLET_PASS_TYPE_ID") || readEnv("APPLE_WALLET_PASS_TYPE_IDENTIFIER");
}

export function getAppleWalletTeamId(): string {
  return readEnv("APPLE_WALLET_TEAM_ID");
}

export function isAppleWalletSigningConfigured(): boolean {
  return getAppleWalletSigningConfig() != null;
}

export function getAppleWalletSigningConfig(): AppleWalletSigningConfig | null {
  const passTypeIdentifier = getAppleWalletPassTypeIdentifier();
  const teamIdentifier = getAppleWalletTeamId();
  const signerCert = normalizePem(readEnv("APPLE_WALLET_SIGNER_CERT"));
  const signerKey = normalizePem(readEnv("APPLE_WALLET_SIGNER_KEY"));
  const signerKeyPassphrase = readEnv("APPLE_WALLET_SIGNER_KEY_PASSPHRASE");
  if (!passTypeIdentifier || !teamIdentifier || !signerCert || !signerKey) return null;
  if (!signerCert.includes("BEGIN CERTIFICATE") || !signerKey.includes("BEGIN")) return null;
  return {
    passTypeIdentifier,
    teamIdentifier,
    signerCert,
    signerKey,
    signerKeyPassphrase,
    wwdr: APPLE_WWDR_G4_PEM,
  };
}

export function isAppleWalletApnsConfigured(): boolean {
  return getAppleWalletApnsConfig() != null;
}

export function getAppleWalletApnsConfig(): AppleWalletApnsConfig | null {
  const teamIdentifier = getAppleWalletTeamId();
  const keyId = readEnv("APPLE_WALLET_APNS_KEY_ID");
  const privateKey = normalizePem(readEnv("APPLE_WALLET_APNS_KEY"));
  const passTypeIdentifier = getAppleWalletPassTypeIdentifier();
  if (!teamIdentifier || !keyId || !privateKey || !passTypeIdentifier) return null;
  if (!privateKey.includes("BEGIN PRIVATE KEY") && !privateKey.includes("BEGIN EC PRIVATE KEY")) return null;
  return { teamIdentifier, keyId, privateKey, passTypeIdentifier };
}

export function appleWalletWebServiceUrl(origin: string): string | null {
  const base = origin.replace(/\/$/, "");
  if (!base.startsWith("https://")) return null;
  return `${base}/api/wallet`;
}

export function isAppleWalletPassType(value: string): boolean {
  const expected = getAppleWalletPassTypeIdentifier();
  return Boolean(expected) && value === expected;
}
