import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export type FitmeProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  onboarding_completed: boolean;
};

export async function getFitmeUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireFitmeUser() {
  const user = await getFitmeUser();
  if (!user) redirect("/signup");
  return user;
}

export async function requireFitmeApiUser(): Promise<
  { user: User; unauthorized: null } | { user: null; unauthorized: NextResponse }
> {
  const user = await getFitmeUser();
  if (!user) {
    return { user: null, unauthorized: NextResponse.json({ error: "Non autorisé." }, { status: 401 }) };
  }
  return { user, unauthorized: null };
}

export async function ensureProfile(userId: string, email?: string | null): Promise<FitmeProfile> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id, email, first_name, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    if (email && existing.email !== email) {
      await admin.from("profiles").update({ email }).eq("id", userId);
      return { ...existing, email };
    }
    return existing as FitmeProfile;
  }

  const { data: created, error } = await admin
    .from("profiles")
    .insert({ id: userId, email: email ?? null })
    .select("id, email, first_name, onboarding_completed")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Impossible de créer le profil.");
  }

  return created as FitmeProfile;
}
