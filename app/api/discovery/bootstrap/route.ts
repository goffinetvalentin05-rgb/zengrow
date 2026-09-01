import { NextResponse } from "next/server";
import { ensureDiscoveryProfile } from "@/src/lib/discovery/auth";
import { createClient } from "@/src/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const profile = await ensureDiscoveryProfile(data.user);
    return NextResponse.json({
      onboardingCompleted: profile.onboardingCompleted,
      username: profile.username,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bootstrap failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
