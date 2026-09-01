import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import {
  MAX_ACTIVE_PROFILE_BLOCKS,
  MAX_BLOCK_CTA_LABEL,
  MAX_BLOCK_DESCRIPTION,
  MAX_BLOCK_TITLE,
  MAX_PROFILE_BLOCKS,
  PROFILE_BLOCK_DEFAULTS,
  isProfileBlockType,
  type ProfileBlockType,
} from "@/src/lib/discovery/conversion";
import { discoveryHasPro } from "@/src/lib/discovery/pro";
import { createClient } from "@/src/lib/supabase/server";

function isProSession(session: { subscription: { plan: "free" | "pro"; status: string }; isOwnerDev: boolean }) {
  return discoveryHasPro({
    plan: session.subscription.plan,
    status: session.subscription.status as "inactive" | "active" | "canceled" | "past_due" | "trialing",
    isOwnerDev: session.isOwnerDev,
  });
}

function sanitizeBlock(body: Record<string, unknown>, fallbackType?: string) {
  const blockType = isProfileBlockType(String(body.blockType ?? fallbackType ?? ""))
    ? (body.blockType as ProfileBlockType)
    : isProfileBlockType(fallbackType)
      ? fallbackType
      : "custom";
  const defaults = PROFILE_BLOCK_DEFAULTS[blockType];
  const urlRaw = typeof body.url === "string" ? body.url.trim() : "";
  return {
    block_type: blockType,
    title: typeof body.title === "string" ? body.title.trim().slice(0, MAX_BLOCK_TITLE) || null : defaults.title,
    description:
      typeof body.description === "string"
        ? body.description.trim().slice(0, MAX_BLOCK_DESCRIPTION) || null
        : defaults.description || null,
    cta_label:
      typeof body.ctaLabel === "string"
        ? body.ctaLabel.trim().slice(0, MAX_BLOCK_CTA_LABEL) || defaults.ctaLabel
        : defaults.ctaLabel,
    url: urlRaw ? normalizeHttpUrl(urlRaw) : null,
    is_active: typeof body.isActive === "boolean" ? body.isActive : true,
  };
}

export async function POST(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  if (!isProSession(session)) {
    return NextResponse.json({ error: "Premium blocks are a Pro feature." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isProfileBlockType(String(body.blockType ?? ""))) {
    return NextResponse.json({ error: "Unknown block type." }, { status: 400 });
  }
  const supabase = await createClient();
  const { count } = await supabase
    .from("profile_blocks")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", session.profile.id);
  if ((count ?? 0) >= MAX_PROFILE_BLOCKS) {
    return NextResponse.json({ error: `Maximum ${MAX_PROFILE_BLOCKS} blocks.` }, { status: 400 });
  }
  const row = sanitizeBlock(body);
  if (row.is_active) {
    const { count: activeCount } = await supabase
      .from("profile_blocks")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", session.profile.id)
      .eq("is_active", true);
    if ((activeCount ?? 0) >= MAX_ACTIVE_PROFILE_BLOCKS) {
      row.is_active = false;
    }
  }
  const { error } = await supabase.from("profile_blocks").insert({
    profile_id: session.profile.id,
    sort_index: count ?? 0,
    ...row,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const body = (await request.json().catch(() => ({}))) as {
    items?: { id: string; sortIndex: number }[];
    id?: string;
    blockType?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    url?: string;
    isActive?: boolean;
  };
  const supabase = await createClient();

  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      if (!item.id) continue;
      await supabase
        .from("profile_blocks")
        .update({ sort_index: item.sortIndex })
        .eq("id", item.id)
        .eq("profile_id", session.profile.id);
    }
    return NextResponse.json({ ok: true });
  }

  if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const clearing = body.isActive === false || (typeof body.url === "string" && !body.url.trim());
  if (!clearing && !isProSession(session) && (body.title != null || body.url != null || body.ctaLabel != null)) {
    return NextResponse.json({ error: "Premium blocks are a Pro feature." }, { status: 403 });
  }
  if (!isProSession(session) && body.isActive === true) {
    return NextResponse.json({ error: "Premium blocks are a Pro feature." }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("profile_blocks")
    .select("*")
    .eq("id", body.id)
    .eq("profile_id", session.profile.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Block not found." }, { status: 404 });

  const row = sanitizeBlock(body as Record<string, unknown>, String(existing.block_type));
  if (typeof body.isActive !== "boolean") row.is_active = existing.is_active !== false;
  if (typeof body.url !== "string") row.url = (existing.url as string | null) ?? null;
  if (typeof body.title !== "string") row.title = (existing.title as string | null) ?? row.title;
  if (typeof body.description !== "string") {
    row.description = (existing.description as string | null) ?? row.description;
  }
  if (typeof body.ctaLabel !== "string") {
    row.cta_label = (existing.cta_label as string | null) ?? row.cta_label;
  }

  const { error } = await supabase
    .from("profile_blocks")
    .update(row)
    .eq("id", body.id)
    .eq("profile_id", session.profile.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const supabase = await createClient();
  await supabase.from("profile_blocks").delete().eq("id", body.id).eq("profile_id", session.profile.id);
  return NextResponse.json({ ok: true });
}
