import Link from "next/link";
import { fitmeBody, fitmeDisplay } from "@/components/fitme-landing/fonts";
import { PRODUCT, ROUTES } from "@/components/fitme-landing/config";
import { ONBOARDING_STEPS } from "@/src/lib/fitme/constants";
import "@/components/fitme-landing/fitme.css";
import "./fitme-app.css";

export function FitmeAppShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className={`fitme fitme-app ${fitmeDisplay.variable} ${fitmeBody.variable}`}>
      <div className="fitme-app-glow" aria-hidden />
      <header className="fitme-app-bar">
        <Link href={ROUTES.home} className="fitme-wordmark">
          {PRODUCT.name}
        </Link>
        {right ?? (
          <Link href="/account" className="fitme-app-bar__link">
            Compte
          </Link>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

export function FitmeFlowShell({
  children,
  step,
  total = 3,
}: {
  children: React.ReactNode;
  step: number;
  total?: number;
}) {
  return (
    <div className={`fitme fitme-app ${fitmeDisplay.variable} ${fitmeBody.variable}`}>
      <div className="fitme-app-glow" aria-hidden />
      <header className="fitme-app-bar">
        <Link href={ROUTES.home} className="fitme-wordmark">
          {PRODUCT.name}
        </Link>
        <span className="fitme-app-bar__link">
          {String(step).padStart(2, "0")} {ONBOARDING_STEPS[step - 1]?.label ?? ""}
        </span>
      </header>
      <div className="fitme-progress" aria-hidden>
        {Array.from({ length: total }, (_, index) => (
          <i key={index} className={index < step ? "is-on" : undefined} />
        ))}
      </div>
      <main className="fitme-flow">{children}</main>
    </div>
  );
}
