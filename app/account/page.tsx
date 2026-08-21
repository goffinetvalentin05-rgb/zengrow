import { AccountClient } from "@/components/fitme-app/AccountClient";
import { ensureProfile, requireFitmeUser } from "@/src/lib/fitme/auth";
import { getUserAnalyses } from "@/src/lib/fitme/routing";

export default async function AccountPage() {
  const user = await requireFitmeUser();
  const profile = await ensureProfile(user.id, user.email);
  const analyses = await getUserAnalyses(user.id);

  return (
    <AccountClient
      firstName={profile.first_name}
      email={user.email ?? profile.email}
      analyses={analyses.map((analysis) => ({
        id: analysis.id,
        status: analysis.status,
        paymentStatus: analysis.payment_status,
        isUnlocked: analysis.is_unlocked && analysis.payment_status === "paid",
        createdAt: analysis.created_at,
        primaryStyle:
          analysis.is_unlocked && analysis.payment_status === "paid" ? analysis.primary_style : null,
      }))}
    />
  );
}
