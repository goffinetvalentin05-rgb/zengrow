import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { getPublicSiteUrl } from "@/src/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: "Learn the English you actually use",
  description: "Learn from your real conversations, podcasts, videos and everyday life — then remember it.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }
  if (params.error) {
    redirect(`${LEARN_ROUTES.login}?error=oauth`);
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-[#08070b] px-6 text-white">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">English</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Learn the English you actually use.</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
          Learn from your real conversations, podcasts, videos and everyday life — then remember it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={LEARN_ROUTES.signup}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Get started
          </Link>
          <Link
            href={LEARN_ROUTES.login}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
