import { AdminView } from "@/src/components/discovery/admin-view";
import { requireAdminSession } from "@/src/lib/discovery/auth";
import { getCategories, getCategoryProfileCounts } from "@/src/lib/discovery/queries";
import { mapProfile, mapProject } from "@/src/lib/discovery/mappers";
import { createClient } from "@/src/lib/supabase/server";

export default async function AdminPage() {
  await requireAdminSession();
  const supabase = await createClient();
  const [profilesRes, categories, projectsRes, claimsRes, reportsRes, subsRes, counts] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
    getCategories(supabase),
    supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("profile_claims").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("profile_reports").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("user_subscriptions").select("user_id, plan, status"),
    getCategoryProfileCounts(supabase),
  ]);

  return (
    <AdminView
      profiles={(profilesRes.data ?? []).map((row) => mapProfile(row as Record<string, unknown>))}
      categories={categories.map((cat) => ({ ...cat, profileCount: counts.get(cat.id) ?? 0 }))}
      projects={(projectsRes.data ?? []).map((row) => mapProject(row as Record<string, unknown>))}
      claims={(claimsRes.data ?? []) as { id: string; profile_id: string; status: string; proof_note: string | null; created_at: string }[]}
      reports={(reportsRes.data ?? []) as { id: string; profile_id: string; reason: string; status: string; created_at: string }[]}
      subscriptions={(subsRes.data ?? []) as { user_id: string; plan: string; status: string }[]}
    />
  );
}
