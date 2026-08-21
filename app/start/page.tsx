import { ensureProfile, getFitmeUser } from "@/src/lib/fitme/auth";
import { getLatestAnalysis, resolveFitmePath } from "@/src/lib/fitme/routing";
import { StartClient } from "@/components/fitme-app/StartClient";

export default async function StartPage() {
  const user = await getFitmeUser();
  if (!user) {
    return <StartClient signedIn={false} href="/signup" status={null} firstName={null} />;
  }

  const profile = await ensureProfile(user.id, user.email);
  const analysis = await getLatestAnalysis(user.id);
  return (
    <StartClient
      signedIn
      href={resolveFitmePath(analysis)}
      status={analysis?.status ?? null}
      firstName={profile.first_name}
    />
  );
}
