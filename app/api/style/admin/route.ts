import { NextResponse } from "next/server";
import { isOwnerEmail } from "@/src/lib/access";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError } from "@/src/lib/fitme/http";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function GET() {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  if (!isOwnerEmail(user.email)) return jsonError("Non autorisé.", 403);

  const admin = createAdminClient();
  const [{ data: analyses }, { data: payments }] = await Promise.all([
    admin
      .from("style_analyses")
      .select("id, user_id, status, payment_status, is_unlocked, error_message, created_at, completed_at, primary_style")
      .order("created_at", { ascending: false })
      .limit(80),
    admin
      .from("payments")
      .select("id, user_id, analysis_id, amount, currency, status, created_at, stripe_checkout_session_id")
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  return NextResponse.json({ analyses: analyses ?? [], payments: payments ?? [] });
}
