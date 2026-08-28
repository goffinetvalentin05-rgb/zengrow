import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export type StripeRevenueSummary = {
  connected: true;
  livemode: boolean;
  currency: string;
  mrrCents: number;
  activeSubscriptions: number;
  volume30dCents: number | null;
  lastSyncedAt: string;
  stale: boolean;
};

type StripeConfig = {
  secretEnc?: string;
  livemode?: boolean;
  keyLast4?: string;
  currency?: string;
  mrrCents?: number;
  activeSubscriptions?: number;
  volume30dCents?: number | null;
  lastSyncedAt?: string;
};

const KEY_RE = /^(sk|rk)_(live|test)_[A-Za-z0-9]+$/;

export function looksLikeStripeSecret(value: string) {
  return KEY_RE.test(value.trim());
}

function encryptionKey() {
  const material =
    process.env.INTEGRATION_SECRET || process.env.STRIPE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!material) throw new Error("Clé de chiffrement des intégrations manquante.");
  return createHash("sha256").update(material).digest();
}

export function encryptStripeSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptStripeSecret(stored: string) {
  const trimmed = stored.trim();
  if (looksLikeStripeSecret(trimmed)) return trimmed;
  const [version, ivB64, tagB64, dataB64] = trimmed.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Clé Stripe illisible.");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

function monthlyCents(price: Stripe.Price, quantity: number) {
  const amount = price.unit_amount ?? 0;
  if (!amount) return 0;
  const interval = price.recurring?.interval;
  const count = price.recurring?.interval_count ?? 1;
  if (interval === "year") return (amount * quantity) / (12 * count);
  if (interval === "week") return ((amount * quantity) * (52 / count)) / 12;
  if (interval === "day") return ((amount * quantity) * (365 / count)) / 12;
  return (amount * quantity) / count;
}

async function fetchLiveSummary(secretKey: string): Promise<Omit<StripeRevenueSummary, "connected" | "stale">> {
  const stripe = new Stripe(secretKey);
  let mrrCents = 0;
  let activeSubscriptions = 0;
  let currency = "eur";
  let startingAfter: string | undefined;

  for (let page = 0; page < 8; page += 1) {
    const list = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      expand: ["data.items.data.price"],
    });
    for (const subscription of list.data) {
      activeSubscriptions += 1;
      for (const item of subscription.items.data) {
        const price = item.price;
        if (!price?.recurring) continue;
        if (price.currency) currency = price.currency;
        mrrCents += monthlyCents(price, item.quantity ?? 1);
      }
    }
    if (!list.has_more || !list.data.length) break;
    startingAfter = list.data[list.data.length - 1]?.id;
  }

  let volume30dCents: number | null = null;
  try {
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const charges = await stripe.charges.list({ created: { gte: since }, limit: 100 });
    volume30dCents = charges.data
      .filter((charge) => charge.paid && !charge.refunded)
      .reduce((sum, charge) => sum + charge.amount, 0);
  } catch {
    volume30dCents = null;
  }

  return {
    livemode: secretKey.includes("_live_"),
    currency,
    mrrCents: Math.round(mrrCents),
    activeSubscriptions,
    volume30dCents,
    lastSyncedAt: new Date().toISOString(),
  };
}

async function loadStripeRow(supabase: SupabaseClient, restaurantId: string) {
  const { data } = await supabase
    .from("integrations")
    .select("id, status, config")
    .eq("restaurant_id", restaurantId)
    .eq("provider", "stripe")
    .maybeSingle();
  return data as { id: string; status: string; config: StripeConfig } | null;
}

function summaryFromCache(config: StripeConfig, stale: boolean): StripeRevenueSummary | null {
  if (typeof config.mrrCents !== "number") return null;
  return {
    connected: true,
    livemode: Boolean(config.livemode),
    currency: config.currency || "eur",
    mrrCents: config.mrrCents,
    activeSubscriptions: config.activeSubscriptions ?? 0,
    volume30dCents: config.volume30dCents ?? null,
    lastSyncedAt: config.lastSyncedAt || new Date().toISOString(),
    stale,
  };
}

export async function connectStripeAccount(supabase: SupabaseClient, restaurantId: string, secretKey: string) {
  const key = secretKey.trim();
  if (!looksLikeStripeSecret(key)) {
    throw new Error("Clé Stripe invalide. Utilisez une clé restreinte rk_live_… ou rk_test_…");
  }

  let live: Omit<StripeRevenueSummary, "connected" | "stale">;
  try {
    live = await fetchLiveSummary(key);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    throw new Error(
      detail.includes("Invalid API Key")
        ? "Clé Stripe refusée. Vérifiez la clé et ses permissions en lecture."
        : "Impossible de lire votre compte Stripe. La clé doit avoir l’accès lecture aux abonnements.",
    );
  }

  const config: StripeConfig = {
    secretEnc: encryptStripeSecret(key),
    keyLast4: key.slice(-4),
    ...live,
  };
  const { error } = await supabase.from("integrations").upsert(
    {
      restaurant_id: restaurantId,
      provider: "stripe",
      status: "connected",
      connected_at: new Date().toISOString(),
      config,
    },
    { onConflict: "restaurant_id,provider" },
  );
  if (error) throw new Error(error.message);
  return { ...live, connected: true as const, stale: false };
}

export async function disconnectStripeAccount(supabase: SupabaseClient, restaurantId: string) {
  const { error } = await supabase
    .from("integrations")
    .update({
      status: "available",
      connected_at: null,
      config: {},
    })
    .eq("restaurant_id", restaurantId)
    .eq("provider", "stripe");
  if (error) throw new Error(error.message);
}

export async function getStripeRevenueSummary(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<StripeRevenueSummary | null> {
  const row = await loadStripeRow(supabase, restaurantId);
  if (!row || row.status !== "connected") return null;
  const config = row.config ?? {};
  if (!config.secretEnc) return summaryFromCache(config, true);

  try {
    const secret = decryptStripeSecret(config.secretEnc);
    const live = await fetchLiveSummary(secret);
    const nextConfig: StripeConfig = {
      ...config,
      ...live,
    };
    await supabase
      .from("integrations")
      .update({ config: nextConfig })
      .eq("restaurant_id", restaurantId)
      .eq("provider", "stripe");
    return { ...live, connected: true, stale: false };
  } catch {
    return summaryFromCache(config, true);
  }
}
