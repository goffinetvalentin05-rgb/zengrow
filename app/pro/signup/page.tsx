"use client";

import { FormEvent, useState } from "react";
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

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signupError) {
      setError(translateAuthError(signupError, t.auth.errors, t.auth.errors.generic));
      setIsLoading(false);
      return;
    }

    if (!signupData.session) {
      setInfo(t.auth.signup.confirmEmail);
      setIsLoading(false);
      return;
    }

    await fetch("/api/discovery/bootstrap", { method: "POST" });
    router.push(DISCOVERY_ROUTES.onboarding);
  }

  return (
    <ZenGrowAuthLayout intent="signup" footerLine={null}>
      <AuthCard>
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-zg-display)] text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem]">
            {t.auth.signup.title}
          </h1>
          <p className="mt-3 max-w-[38ch] text-pretty text-sm leading-relaxed text-white/50">
            {t.auth.signup.subtitle}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className={authFieldLabel}>
              {t.auth.name}
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={authInputClassName}
              placeholder={t.auth.signup.namePlaceholder}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className={authFieldLabel}>
              {t.auth.email}
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClassName}
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className={authFieldLabel}>
              {t.auth.password}
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={authInputClassName}
              placeholder={t.auth.signup.passwordPlaceholder}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
            {isLoading ? t.auth.signup.submitting : t.auth.signup.submit}
          </Button>
        </form>

        {error ? <p className={authErrorClassName + " mt-4"}>{error}</p> : null}
        {info ? (
          <p className="mt-4 rounded-xl border border-[#8b7cff]/25 bg-[#6e56cf]/15 px-3.5 py-3 text-sm font-medium text-[#f4f0ff]">
            {info}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-white/45">
          {t.auth.signup.hasAccount}{" "}
          <Link href={DISCOVERY_ROUTES.login} className={authLinkClassName}>
            {t.auth.signup.logIn}
          </Link>
        </p>
      </AuthCard>
    </ZenGrowAuthLayout>
  );
}
