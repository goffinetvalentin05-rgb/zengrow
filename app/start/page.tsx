import { redirect } from "next/navigation";
import { ensureProfile, getFitmeUser } from "@/src/lib/fitme/auth";
import { getLatestAnalysis, resolveFitmePath } from "@/src/lib/fitme/routing";

export default async function StartPage() {
  const user = await getFitmeUser();
  if (!user) redirect("/signup");

  await ensureProfile(user.id, user.email);
  const analysis = await getLatestAnalysis(user.id);
  redirect(resolveFitmePath(analysis));
}
