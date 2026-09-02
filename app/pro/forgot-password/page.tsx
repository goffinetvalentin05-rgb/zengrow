"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthCard, ZenGrowAuthLayout } from "@/src/components/auth/zengrow-auth-page-shell";
import { translateAuthError } from "@/src/lib/auth-error-fr";
import { useI18n } from "@/src/i18n/provider";
import {
  authErrorClassName,
  authFieldLabel,
  authInputClassName,
  authLinkClassName,
  authSubmitClassName,
  authSuccessClassName,
} from "@/src/lib/auth/auth-form-styles";
import { getPasswordRecoveryRedirectUrl } from "@/src/lib/site-url";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const redirectTo = getPasswordRecoveryRedirectUrl();
    if (!redirectTo) {
      setError(t.auth.forgot.configError);
      setIsLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setIsLoading(false);

    if (resetError) {
      setError(
        translateAuthError(resetError, t.auth.errors, t.auth.errors.resetFailed),
      );
      return;
    }

    setSuccess(true);
  }

  return (
    <ZenGrowAuthLayout intent="recover" footerLine={null}>
      <AuthCard>
        <div className="mb-8">
          <h1 className="text-balance font-[family-name:var(--font-zg-display)] text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem] sm:leading-tight">
            {t.auth.forgot.title}
          </h1>
          <p className="mt-3 max-w-[36ch] text-pretty text-sm leading-relaxed text-white/50">
            {t.auth.forgot.subtitle}
          </p>
        </div>

        {success ? (
          <div className={authSuccessClassName} role="status">
            {t.auth.forgot.success}
          </div>
        ) : (
          <form className="relative space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="forgot-email" className={authFieldLabel}>
                {t.auth.email}
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder={t.auth.forgot.placeholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={authInputClassName}
              />
            </div>

            <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
              {isLoading ? t.auth.forgot.submitting : t.auth.forgot.submit}
            </Button>
          </form>
        )}

        <div className="mt-6 min-h-[1.25rem]" role="status" aria-live="polite" aria-atomic="true">
          {error ? <p className={authErrorClassName}>{error}</p> : null}
        </div>

        <p className="mt-6 text-sm text-white/45">
          <Link href="/pro/login" className={authLinkClassName}>
            {t.auth.forgot.back}
          </Link>
        </p>
      </AuthCard>
    </ZenGrowAuthLayout>
  );
}
