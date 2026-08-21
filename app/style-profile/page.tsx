import { redirect } from "next/navigation";
import { ensureProfile, requireFitmeUser } from "@/src/lib/fitme/auth";
import { getLatestAnalysis, resolveFitmePath } from "@/src/lib/fitme/routing";
import { isFullyUnlockedProfile } from "@/src/lib/style-analysis/serialize";
import { StyleProfileClient } from "@/components/fitme-app/StyleProfileClient";

export default async function StyleProfilePage() {
  const user = await requireFitmeUser();
  const profile = await ensureProfile(user.id, user.email);
  const analysis = await getLatestAnalysis(user.id);

  if (!analysis) redirect("/onboarding");
  if (!isFullyUnlockedProfile(analysis)) redirect(resolveFitmePath(analysis));

  return <StyleProfileClient analysisId={analysis.id} firstName={profile.first_name} />;
}
