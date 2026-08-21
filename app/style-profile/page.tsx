import { redirect } from "next/navigation";
import { StyleProfileClient } from "@/components/fitme-app/StyleProfileClient";
import { requireFitmeUser } from "@/src/lib/fitme/auth";
import { getLatestAnalysis } from "@/src/lib/fitme/routing";
import { isActuallyUnlocked } from "@/src/lib/style-analysis/serialize";

export default async function StyleProfilePage() {
  const user = await requireFitmeUser();
  const analysis = await getLatestAnalysis(user.id);

  if (!analysis) redirect("/onboarding");
  if (analysis.status !== "completed") redirect(`/analysis/${analysis.id}`);
  if (!isActuallyUnlocked(analysis)) redirect(`/analysis/${analysis.id}/preview`);

  return <StyleProfileClient analysisId={analysis.id} />;
}
