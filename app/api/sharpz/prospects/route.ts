import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

type ProspectInput = {
  type?: "company" | "individual";
  name?: string | null;
  company?: string;
  email?: string | null;
  phone?: string | null;
  url?: string | null;
  contact?: string | null;
  source?: string | null;
  whyFit?: string | null;
  fitScore?: number | null;
  lastAction?: string | null;
  contactedAt?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string | null;
};

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{ prospects?: ProspectInput[] }>(request);
  const prospects = (body?.prospects ?? []).filter((item) => item.company?.trim());
  if (!prospects.length) {
    return NextResponse.json({ error: "Aucun prospect à ajouter." }, { status: 400 });
  }

  const { error } = await supabase.from("prospects").insert(
    prospects.map((item) => ({
      restaurant_id: restaurant.id,
      prospect_type: item.type === "individual" ? "individual" : "company",
      name: item.name?.trim() || null,
      company: item.company!.trim(),
      email: item.email?.trim() || null,
      phone: item.phone?.trim() || null,
      url: item.url ?? null,
      contact: item.contact ?? null,
      source: item.source?.trim() || null,
      why_fit: item.whyFit ?? null,
      fit_score: item.fitScore ?? null,
      last_action: item.lastAction?.trim() || null,
      contacted_at: item.contactedAt || null,
      next_follow_up_at: item.nextFollowUpAt || null,
      notes: item.notes ?? null,
      status: "new",
    })),
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, count: prospects.length });
}
