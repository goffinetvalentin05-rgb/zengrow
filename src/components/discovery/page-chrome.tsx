import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
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
      >
        {children}
      </DiscoveryShell>
    );
  }

  return (
    <div className={cn(zgBody.className, "relative min-h-dvh bg-[#08070b] text-white")}>
      <AppAmbientBackground />
      <div className="relative z-10">
        <PublicHeader loggedIn={Boolean(session)} />
        {children}
      </div>
    </div>
  );
}
