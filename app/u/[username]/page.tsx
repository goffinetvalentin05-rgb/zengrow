import type { Metadata } from "next";
import { PublicHeader } from "@/src/components/discovery/public-header";
import { PublicProfileView } from "@/src/components/discovery/public-profile";
import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { getProfileByUsername } from "@/src/lib/discovery/queries";
import { zgBody } from "@/components/zg-landing/fonts";
import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import { cn } from "@/src/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { username } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const profile = await getProfileByUsername(supabase, username, session?.profile.id);
  if (!profile) notFound();
  const source =
    from === "explore" || from === "search" || from === "category" || from === "following" || from === "saved"
      ? from
      : "direct";

  return (
    <div className={cn(zgBody.className, "relative min-h-dvh bg-[#08070b] text-white")}>
      <AppAmbientBackground />
      <div className="relative z-10">
        <PublicHeader loggedIn={Boolean(session)} />
        <main className="px-5 py-8 md:px-10">
          <PublicProfileView
            profile={profile}
            isOwner={session?.profile.id === profile.id}
            isLoggedIn={Boolean(session)}
            source={source}
          />
        </main>
      </div>
    </div>
  );
}
