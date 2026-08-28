import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  buildWorkspaceInsights,
  ensureIntegrations,
  persistInsights,
  upsertSaasFromOnboarding,
} from "@/src/lib/sharpz/insights";
import type { ScanResult } from "@/src/lib/sharpz/types";

type Payload = {
  url?: string | null;
  scan?: ScanResult | null;
  pricingSummary?: string | null;
  stage?: string;
  primaryObjective?: string;
  extraObjectives?: string[];
  channels?: string[];
};

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;

  const body = await parseJson<Payload>(request);
  const stage = body?.stage?.trim() || "mvp";
  const primaryObjective = body?.primaryObjective?.trim() || "other";
  const extraObjectives = (body?.extraObjectives ?? []).filter((item) => item && item !== primaryObjective);
  const channels = body?.channels ?? [];
  const scan = body?.scan ?? null;
  const url = body?.url ?? scan?.extract.finalUrl ?? null;
  const name = scan?.detected.name || restaurant.name;

  await upsertSaasFromOnboarding(supabase, restaurant.id, {
    scan,
    name,
    url,
    pricingSummary: body?.pricingSummary ?? null,
    stage,
  });

  await supabase.from("user_objectives").delete().eq("restaurant_id", restaurant.id);
  await supabase.from("user_objectives").insert([
    { restaurant_id: restaurant.id, key: primaryObjective, is_primary: true },
    ...extraObjectives.map((key) => ({ restaurant_id: restaurant.id, key, is_primary: false })),
  ]);

  await supabase.from("acquisition_channels").delete().eq("restaurant_id", restaurant.id);
  if (channels.length) {
    await supabase.from("acquisition_channels").insert(
      channels.map((channel) => ({ restaurant_id: restaurant.id, channel })),
    );
  }

  await ensureIntegrations(supabase, restaurant.id);

  const bundle = await buildWorkspaceInsights({
    saasName: name,
    url,
    description: scan?.detected.description ?? null,
    stage,
    primaryObjective,
    extraObjectives,
    channels,
    scan,
    locale: "fr",
  });

  await persistInsights(supabase, restaurant.id, bundle, url, null);

  return NextResponse.json({ ok: true });
}
