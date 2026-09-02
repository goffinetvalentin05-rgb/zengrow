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
import { translateAuthError } from "@/src/lib/auth-error-fr";
import { useI18n } from "@/src/i18n/provider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(translateAuthError(signInError, t.auth.errors, t.auth.errors.signInFailed));
        return;
      }

      if (!data.session) {
        setError(t.auth.errors.signInFailed);
        return;
      }

      router.refresh();

      let onboardingCompleted = false;

      try {
        const bootstrapResponse = await fetch("/api/discovery/bootstrap", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
        });

        if (bootstrapResponse.ok) {
          const payload = (await bootstrapResponse.json()) as { onboardingCompleted?: boolean };
          onboardingCompleted = Boolean(payload.onboardingCompleted);
        } else if (bootstrapResponse.status === 401) {
          await router.refresh();
          const retry = await fetch("/api/discovery/bootstrap", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
          });
          if (retry.ok) {
            const payload = (await retry.json()) as { onboardingCompleted?: boolean };
            onboardingCompleted = Boolean(payload.onboardingCompleted);
          }
        }
      } catch {
        // Bootstrap is best-effort; middleware will finish profile setup after redirect.
      }

      const destination = onboardingCompleted ? DISCOVERY_ROUTES.explore : DISCOVERY_ROUTES.onboarding;
      window.location.assign(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ZenGrowAuthLayout intent="login" footerLine={null}>
      <AuthCard>
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-zg-display)] text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem]">
            {t.auth.login.title}
          </h1>
          <p className="mt-3 max-w-[38ch] text-pretty text-sm leading-relaxed text-white/50">
            {t.auth.login.subtitle}
          </p>
        </div>

        <form className="relative" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={authFieldLabel}>
              {t.auth.email}
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
              {t.auth.password}
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
                {t.auth.login.forgot}
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
              {isLoading ? t.auth.login.submitting : t.auth.login.submit}
            </Button>
          </div>
        </form>

        <div className="mt-5 min-h-[1.25rem]" role="status" aria-live="polite" aria-atomic="true">
          {error ? <p className={authErrorClassName}>{error}</p> : null}
        </div>

        <p className="mt-6 text-sm text-white/45">
          {t.auth.login.noAccount}{" "}
          <Link href={DISCOVERY_ROUTES.signup} className={authLinkClassName}>
            {t.auth.login.create}
          </Link>
        </p>
      </AuthCard>
    </ZenGrowAuthLayout>
  );
}
