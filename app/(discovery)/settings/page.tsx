import { SettingsView } from "@/src/components/discovery/settings-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { isSharpzProActive } from "@/src/lib/discovery/pro";

export default async function SettingsPage() {
  const session = await requireOnboardedSession();
  const isPro = isSharpzProActive({
    plan: session.subscription.plan,
    status: session.subscription.status,
    isOwnerDev: session.isOwnerDev,
  });
  return (
    <div className="px-5 md:px-0">
      <SettingsView email={session.user.email} subscription={session.subscription} isPro={isPro} isAdmin={session.profile.isAdmin || session.isOwnerDev} />
    </div>
  );
}
