import { NextResponse } from "next/server";
import { classifyPublicSlug } from "@/src/lib/discovery/public-link";
import { normalizePublicSlug } from "@/src/lib/discovery/slug";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("value") ?? url.searchParams.get("q") ?? "";
  const slug = normalizePublicSlug(raw);
  const format = classifyPublicSlug(slug);
  if (format === "invalid") {
    return NextResponse.json({ slug, status: "invalid" });
  }
  if (format === "reserved") {
    return NextResponse.json({ slug, status: "reserved" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase.from("profiles").select("id, user_id").eq("username", slug).maybeSingle();
  if (!existing) {
    return NextResponse.json({ slug, status: "available" });
  }
  if (user && existing.user_id === user.id) {
    return NextResponse.json({ slug, status: "current" });
  }
  return NextResponse.json({ slug, status: "taken" });
}
