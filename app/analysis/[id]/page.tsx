import { redirect } from "next/navigation";
import { AnalysisClient } from "@/components/fitme-app/AnalysisClient";
import { requireFitmeUser } from "@/src/lib/fitme/auth";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireFitmeUser();
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) redirect("/onboarding");

  if (analysis.status === "completed" && analysis.is_unlocked && analysis.payment_status === "paid") {
    redirect("/style-profile");
  }
  if (analysis.status === "completed") {
    redirect(`/analysis/${id}/preview`);
  }
  if (["draft", "uploaded"].includes(analysis.status)) {
    redirect("/onboarding");
  }

  return <AnalysisClient analysisId={id} />;
}
