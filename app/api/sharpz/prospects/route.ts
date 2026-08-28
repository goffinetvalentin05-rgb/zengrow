import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

type ProspectInput = {
  company?: string;
  url?: string | null;
  contact?: string | null;
  whyFit?: string | null;
  fitScore?: number | null;
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
      company: item.company!.trim(),
      url: item.url ?? null,
      contact: item.contact ?? null,
      why_fit: item.whyFit ?? null,
      fit_score: item.fitScore ?? null,
      notes: item.notes ?? null,
      status: "new",
    })),
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, count: prospects.length });
}
