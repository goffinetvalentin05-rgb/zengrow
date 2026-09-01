import type { SupabaseClient } from "@supabase/supabase-js";
import { computeCompleteness } from "@/src/lib/discovery/completeness";
import { defaultRoleLabel } from "@/src/lib/discovery/role-label";
import { mapProfile } from "@/src/lib/discovery/mappers";
import type { ProfileType } from "@/src/lib/discovery/constants";

export async function syncProfileDerived(supabase: SupabaseClient, profileId: string) {
  const [{ data: profileRow }, { count: projectCount }, { count: socialCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", profileId),
    supabase.from("social_links").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
  ]);
  if (!profileRow) return;
  const profile = mapProfile(profileRow);
  let categoryName: string | null = null;
  if (profile.primaryCategoryId) {
    const { data: cat } = await supabase
      .from("categories")
      .select("name")
      .eq("id", profile.primaryCategoryId)
      .maybeSingle();
    categoryName = cat?.name ?? null;
  }
  const completeness = computeCompleteness({
    profile,
    hasProject: (projectCount ?? 0) > 0,
    socialCount: socialCount ?? 0,
  });
  const roleLabel = defaultRoleLabel(profile.profileType as ProfileType | null, categoryName);
  await supabase.from("profiles").update({ completeness, role_label: roleLabel }).eq("id", profileId);
}
