import { DiscoveryAmbientBackground } from "@/src/components/discovery/discovery-ambient";
import { DiscoveryShell } from "@/src/components/discovery/app-shell";
import { PublicHeader } from "@/src/components/discovery/public-header";
import { zgBody } from "@/components/zg-landing/fonts";
import type { DiscoverySession } from "@/src/lib/discovery/auth";
import { cn } from "@/src/lib/utils";

export function DiscoveryPageChrome({
  session,
  children,
}: {
  session: DiscoverySession | null;
  children: React.ReactNode;
}) {
  if (session?.profile.onboardingCompleted) {
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

  return (
    <div className={cn(zgBody.className, "sz-app relative min-h-dvh bg-[#050506] text-white")}>
      <DiscoveryAmbientBackground />
      <div className="relative z-10">
        <PublicHeader loggedIn={Boolean(session)} />
        {children}
      </div>
    </div>
  );
}
