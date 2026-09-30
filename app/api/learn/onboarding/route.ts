import { NextResponse } from "next/server";
import { requireApiUser } from "@/src/lib/auth/user-session";
import { onboardingInputSchema } from "@/src/lib/learn/onboarding";

export async function POST(request: Request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = onboardingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the onboarding fields." }, { status: 400 });
  }

  const input = parsed.data;
  const metaName = session.user.user_metadata?.full_name;
  const displayName = typeof metaName === "string" && metaName.trim() ? metaName.trim() : null;

  const { error } = await session.supabase.from("learner_profiles").upsert(
    {
      user_id: session.user.id,
      ...(displayName ? { display_name: displayName } : {}),
      ui_language: input.uiLanguage,
      level: input.level,
      primary_goal: input.primaryGoal,
      weekly_minutes: input.weeklyMinutes,
      preferred_activities: input.preferredActivities,
      timezone: input.timezone ?? null,
      onboarding_completed: true,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: "Could not save your profile. Apply the learner migration first." }, { status: 500 });
  }

  const { data: existingSub } = await session.supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!existingSub) {
    await session.supabase.from("user_subscriptions").insert({
      user_id: session.user.id,
      plan: "free",
      status: "inactive",
    });
  }

  return NextResponse.json({ ok: true });
}
