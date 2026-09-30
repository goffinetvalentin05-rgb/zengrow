import { redirect } from "next/navigation";
import { getAuthSession } from "@/src/lib/auth/user-session";
import type { LearnDb } from "@/src/lib/learn/db";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

export async function requireLearnDb(): Promise<LearnDb> {
  const { supabase, user } = await getAuthSession();
  if (!user) redirect(LEARN_ROUTES.login);
  return { supabase, userId: user.id };
}
