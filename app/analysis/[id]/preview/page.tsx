import { redirect } from "next/navigation";
import { PreviewClient } from "@/components/fitme-app/PreviewClient";
import { requireFitmeUser } from "@/src/lib/fitme/auth";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireFitmeUser();
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) redirect("/onboarding");

  if (analysis.status !== "completed") {
    redirect(`/analysis/${id}`);
  }
  if (analysis.is_unlocked && analysis.payment_status === "paid") {
    redirect("/style-profile");
  }

  return <PreviewClient analysisId={id} />;
}
