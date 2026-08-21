import { redirect } from "next/navigation";
import { AnalysisClient } from "@/components/fitme-app/AnalysisClient";
import { requireFitmeUser } from "@/src/lib/fitme/auth";
import { getAnalysisForUser, resolveFitmePath } from "@/src/lib/fitme/routing";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireFitmeUser();
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) redirect("/onboarding");

  const destination = resolveFitmePath(analysis);
  if (!destination.startsWith(`/analysis/${id}`) || destination.endsWith("/preview")) {
    redirect(destination);
  }

  return <AnalysisClient analysisId={id} />;
}
