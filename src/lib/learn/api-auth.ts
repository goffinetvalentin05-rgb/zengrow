import { createAdminClient } from "@/src/lib/supabase/admin";
import type { LearnDb } from "@/src/lib/learn/db";
import { takeRateLimit } from "@/src/lib/learn/rate-limit";
import { hashToken, readBearer } from "@/src/lib/learn/tokens";

export async function authorizeLearnApi(request: Request): Promise<
  { ok: true; db: LearnDb } | { ok: false; status: number; error: string }
> {
  const raw = readBearer(request.headers.get("authorization"));
  if (!raw) return { ok: false, status: 401, error: "Missing bearer token." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, status: 503, error: "API auth is not configured." };
  }

  const tokenHash = hashToken(raw);
  const { data, error } = await admin
    .from("api_tokens")
    .select("id, user_id, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data || data.revoked_at) return { ok: false, status: 401, error: "Invalid token." };

  const limit = takeRateLimit(data.id as string);
  if (!limit.ok) return { ok: false, status: 429, error: "Too many requests." };

  await admin.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).eq("user_id", data.user_id);

  return { ok: true, db: { supabase: admin, userId: data.user_id as string } };
}
