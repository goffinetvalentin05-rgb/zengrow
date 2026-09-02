import { DiscoveryShell } from "@/src/components/discovery/app-shell";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";

export default async function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  const session = await requireOnboardedSession();

  return (
    <DiscoveryShell
      displayName={session.profile.displayName}
      avatarUrl={session.profile.avatarUrl}
      completeness={session.profile.completeness}
      username={session.profile.username}
      preferredLanguage={session.profile.preferredLanguage}
    >
      {children}
    </DiscoveryShell>
  );
}
