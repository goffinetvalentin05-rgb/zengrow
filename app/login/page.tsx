"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    const bootstrapResponse = await fetch("/api/bootstrap-restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!bootstrapResponse.ok) {
      const data = (await bootstrapResponse.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Impossible de préparer le restaurant.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F6FBFA] px-4 py-10 text-[#0F3F3A] sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(61,190,159,0.22),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_50%,rgba(31,122,108,0.12),transparent_50%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(31,122,108,0.1),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#3DBE9F]/35 via-[#1F7A6C]/20 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-gradient-to-tl from-[#1F7A6C]/25 via-[#3DBE9F]/15 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 rounded-full border border-[#CBE6DF]/40 bg-white/5 shadow-[0_0_120px_40px_rgba(61,190,159,0.08)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(15,63,58,0.06)_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-6 flex justify-center sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#CBE6DF]/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-[#0F3F3A]/70 shadow-sm backdrop-blur-md transition hover:border-[#A3D8CC] hover:bg-white/90 hover:text-[#0F3F3A] sm:text-sm"
          >
            <span aria-hidden className="text-[#1F7A6C]">
              ←
            </span>
            Retour à l&apos;accueil
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[1.75rem] border border-[#DDEFEA]/90 bg-white/80 p-8 shadow-[0_24px_80px_-28px_rgba(15,63,58,0.28),0_0_1px_rgba(15,63,58,0.06)] backdrop-blur-2xl sm:p-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-[#3DBE9F]/20 to-transparent blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#1F7A6C]/12 to-transparent blur-2xl"
            aria-hidden
          />

          <div className="relative">
            <div className="mb-8 flex flex-col items-center text-center sm:mb-9">
              <Image
                src="/Zengrow-logo.png"
                alt="ZenGrow"
                width={200}
                height={56}
                className="h-10 w-auto object-contain sm:h-11"
                priority
              />
              <span className="mt-5 inline-flex rounded-full border border-[#CBE6DF] bg-[#F0F9F7]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F7A6C] sm:text-xs sm:tracking-[0.16em]">
                Espace professionnel
              </span>
              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#0F3F3A] sm:text-[2rem] sm:leading-tight">
                Connexion
              </h1>
              <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-[#0F3F3A]/75 sm:text-[0.9375rem]">
                Accédez à votre tableau de bord ZenGrow.
              </p>
              <p className="mt-3 max-w-sm text-pretty text-xs leading-relaxed text-[#0F3F3A]/55 sm:text-sm">
                Gérez vos réservations, disponibilités et avis clients depuis un seul espace.
              </p>
            </div>

            <form className="relative space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="dashboard-field-label">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@restaurant.ch"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="rounded-xl border-[#CBE6DF] bg-white/90 text-[#0F3F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-[#0F3F3A]/35 focus:border-[#1F7A6C]/45 focus:ring-[#1F7A6C]/18"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="dashboard-field-label">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="rounded-xl border-[#CBE6DF] bg-white/90 text-[#0F3F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-[#0F3F3A]/35 focus:border-[#1F7A6C]/45 focus:ring-[#1F7A6C]/18"
                />
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-[15px] font-semibold text-white shadow-[0_16px_40px_-18px_rgba(31,122,108,0.75)] transition hover:scale-[1.01] hover:from-[#1a6b5f] hover:to-[#36b892] hover:shadow-[0_20px_44px_-16px_rgba(31,122,108,0.65)] focus-visible:ring-[#1F7A6C]/45 active:scale-[0.99] disabled:hover:scale-100"
                >
                  {isLoading ? "Connexion en cours…" : "Se connecter"}
                </Button>
              </div>
            </form>

            <div
              className="mt-6 min-h-[1.25rem]"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {error ? (
                <p className="rounded-xl border border-red-200/90 bg-red-50/95 px-3.5 py-3 text-sm leading-snug text-red-800 shadow-sm">
                  {error}
                </p>
              ) : null}
            </div>

            <p className="mt-2 text-center text-sm text-[#0F3F3A]/60">
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#1F7A6C] underline decoration-[#1F7A6C]/25 underline-offset-2 transition hover:text-[#176657] hover:decoration-[#1F7A6C]/50"
              >
                Créer mon restaurant
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-[#0F3F3A]/40 sm:text-xs">
          Réservations en ligne, disponibilités et avis clients — tout ZenGrow, rien de superflu.
        </p>
      </div>
    </main>
  );
}
