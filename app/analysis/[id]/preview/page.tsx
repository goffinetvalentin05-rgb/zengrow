import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PreviewClient } from "@/components/fitme-app/PreviewClient";
import { PAYWALL_STATUSES } from "@/src/lib/fitme/constants";
import { requireFitmeUser } from "@/src/lib/fitme/auth";
import { getAnalysisForUser, resolveFitmePath } from "@/src/lib/fitme/routing";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireFitmeUser();
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) redirect("/onboarding");

  if (!(PAYWALL_STATUSES as readonly string[]).includes(analysis.status)) {
    redirect(resolveFitmePath(analysis));
  }

  return (
    <Suspense>
      <PreviewClient analysisId={id} />
    </Suspense>
  );
}
