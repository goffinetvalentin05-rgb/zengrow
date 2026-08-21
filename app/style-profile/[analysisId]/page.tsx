import { redirect } from "next/navigation";
import { StyleProfileClient } from "@/components/fitme-app/StyleProfileClient";
import { ensureProfile, requireFitmeUser } from "@/src/lib/fitme/auth";
import { getAnalysisForUser, resolveFitmePath } from "@/src/lib/fitme/routing";
import { isFullyUnlockedProfile } from "@/src/lib/style-analysis/serialize";

export default async function StyleProfileByIdPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const user = await requireFitmeUser();
  const profile = await ensureProfile(user.id, user.email);
  const { analysisId } = await params;
  const analysis = await getAnalysisForUser(analysisId, user.id);
  if (!analysis) redirect("/onboarding");
  if (!isFullyUnlockedProfile(analysis)) redirect(resolveFitmePath(analysis));
  return <StyleProfileClient analysisId={analysis.id} firstName={profile.first_name} />;
}
