"use client";

import { FormEvent, useState } from "react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, ZenGrowAuthLayout } from "@/src/components/auth/zengrow-auth-page-shell";
import { createClient } from "@/src/lib/supabase/client";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import {
  authErrorClassName,
  authFieldLabel,
  authInputClassName,
  authLinkClassName,
  authSubmitClassName,
} from "@/src/lib/auth/auth-form-styles";
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

    const bootstrapResponse = await fetch("/api/discovery/bootstrap", { method: "POST" });
    const payload = (await bootstrapResponse.json().catch(() => ({}))) as { onboardingCompleted?: boolean };
    router.push(payload.onboardingCompleted ? DISCOVERY_ROUTES.explore : DISCOVERY_ROUTES.onboarding);
  }

  return (
    <ZenGrowAuthLayout intent="login" footerLine={null}>
      <AuthCard>
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-zg-display)] text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem]">
            Log in
          </h1>
          <p className="mt-3 max-w-[38ch] text-pretty text-sm leading-relaxed text-white/50">
            Continue discovering people worth knowing.
          </p>
        </div>

        <form className="relative" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={authFieldLabel}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={authInputClassName}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="password" className={authFieldLabel}>
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={authInputClassName}
            />
            <div className="mt-2.5 flex justify-end">
              <Link href="/pro/forgot-password" className={cn("text-xs", authLinkClassName)}>
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
              {isLoading ? "Signing in…" : "Log in"}
            </Button>
          </div>
        </form>

        <div className="mt-5 min-h-[1.25rem]" role="status" aria-live="polite" aria-atomic="true">
          {error ? <p className={authErrorClassName}>{error}</p> : null}
        </div>

        <p className="mt-6 text-sm text-white/45">
          No account yet?{" "}
          <Link href={DISCOVERY_ROUTES.signup} className={authLinkClassName}>
            Create your Sharpz
          </Link>
        </p>
      </AuthCard>
    </ZenGrowAuthLayout>
  );
}
