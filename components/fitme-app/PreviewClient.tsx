"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { FitmeReveal } from "@/components/fitme-app/FitmeReveal";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { apiJson } from "@/src/lib/fitme/client-api";
import type { AnalysisPreview } from "@/src/lib/style-analysis/serialize";

const PALETTE_SLOTS = 6;

const BENEFITS = [
  "Top style + style secondaire",
  "Couleurs qui vous mettent en valeur",
  "Votre look recommandé, généré sur vous",
  "Style Profile enregistré dans votre compte",
];

function LockCard({
  kicker,
  caption,
}: {
  kicker: string;
  caption: string;
}) {
  return (
    <article className="fitme-lock-card">
      <p className="fitme-preview-kicker">{kicker}</p>
      <div className="fitme-lock-veil" aria-hidden="true">
        <span className="fitme-lock-ghost" />
        <span className="fitme-lock-ghost is-short" />
        <span className="fitme-lock-shimmer" />
      </div>
      <p className="fitme-lock-caption">{caption}</p>
    </article>
  );
}

export function PreviewClient({ analysisId }: { analysisId: string }) {
  const search = useSearchParams();
  const canceled = search.get("canceled") === "1";
  const reduce = useReducedMotion();
  const [preview, setPreview] = useState<AnalysisPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    trackFitmeEvent("preview_viewed");
    trackFitmeEvent("paywall_viewed");
    void apiJson<{ preview: AnalysisPreview }>(`/api/style-analysis/${analysisId}/preview`)
      .then((data) => setPreview(data.preview))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Impossible de charger l’aperçu."));
  }, [analysisId]);

  async function checkout() {
    setBusy(true);
    setError(null);
    trackFitmeEvent("checkout_started");
    try {
      const data = await apiJson<{ url: string; alreadyPaid?: boolean }>("/api/checkout/style-profile", {
        method: "POST",
        body: JSON.stringify({ analysisId }),
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de démarrer le paiement.");
      setBusy(false);
    }
  }

  if (error && !preview) {
    return (
      <FitmeAppShell>
        <FitmeErrorState title="Aperçu indisponible." message={error} onAction={() => window.location.reload()} />
      </FitmeAppShell>
    );
  }

  const ctaLabel = busy ? "Redirection…" : "Débloquer mon Style Profile";

  return (
    <FitmeAppShell>
      <section className="fitme-flow fitme-preview-page">
        <FitmeReveal className="fitme-preview-hero">
          <p className="fitme-preview-badge">Rapport prêt</p>
          <p className="fitme-eyebrow">Aperçu</p>
          <h1>Votre Style Profile est presque prêt.</h1>
          <p className="fitme-lead">
            Votre analyse est prête. Vous voyez ici une révélation partielle. Le rapport complet, vos couleurs et
            votre recommandation finale restent protégés jusqu’au déblocage.
          </p>
          {canceled ? (
            <p className="fitme-note">Paiement annulé. Rien n’a été débité. Votre aperçu est toujours là.</p>
          ) : null}
        </FitmeReveal>

        <FitmeReveal className="fitme-preview-stage" delay={0.1}>
          <article className="fitme-preview-portrait">
            <div className="fitme-preview-portrait__frame">
              {preview?.portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.portraitUrl} alt="" />
              ) : (
                <span className="fitme-preview-portrait__empty" />
              )}
              <span className="fitme-preview-portrait__veil" aria-hidden="true" />
              <span className="fitme-preview-portrait__scan" aria-hidden="true" />
            </div>
            <p className="fitme-preview-lock-pill">Look final verrouillé</p>
          </article>

          <div className="fitme-preview-styles">
            <LockCard kicker="Style principal" caption="Direction identifiée" />
            <LockCard kicker="Style secondaire" caption="Complément trouvé" />
          </div>

          <article className="fitme-lock-card fitme-preview-palette">
            <p className="fitme-preview-kicker">Palette</p>
            <ul className="fitme-preview-swatches" aria-hidden="true">
              {Array.from({ length: PALETTE_SLOTS }, (_, index) => (
                <li key={index} className="is-locked">
                  <i />
                </li>
              ))}
            </ul>
            <p className="fitme-lock-caption">Couleurs protégées</p>
          </article>
        </FitmeReveal>

        <motion.article
          className="fitme-paywall fitme-preview-paywall"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="fitme-eyebrow">Paiement unique · Sans abonnement</p>
          <h2>Débloquez votre rapport complet.</h2>
          <p className="fitme-lead">
            Nous avons identifié une direction forte. Vos univers les plus flatteurs, vos meilleures couleurs et
            votre look recommandé vous attendent.
          </p>
          <p className="fitme-price">
            <span>{preview?.priceLabel ?? "7,90 CHF"}</span>
            <small>une fois</small>
          </p>
          <ul className="fitme-benefit-list">
            {BENEFITS.map((item) => (
              <li key={item}>
                <span className="fitme-benefit-check" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          {error ? <p className="fitme-error">{error}</p> : null}

          <button
            type="button"
            className="fitme-cta fitme-cta--block fitme-preview-cta"
            disabled={busy}
            onClick={() => void checkout()}
          >
            {ctaLabel}
          </button>
          <p className="fitme-fine">Paiement unique. Déblocage immédiat. Aucun abonnement.</p>
        </motion.article>

        {process.env.NODE_ENV === "development" ? (
          <p className="fitme-preview-dev">
            <button
              type="button"
              className="fitme-cta fitme-cta--ghost"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void apiJson<{ redirect: string }>(`/api/style-analysis/${analysisId}/dev-unlock`, { method: "POST" })
                  .then((data) => {
                    window.location.href = data.redirect;
                  })
                  .catch((err: unknown) => {
                    setError(err instanceof Error ? err.message : "Déblocage local impossible.");
                    setBusy(false);
                  });
              }}
            >
              Tester sans Stripe (dev)
            </button>
          </p>
        ) : null}

        <div className="fitme-sticky-cta fitme-preview-sticky">
          <button type="button" className="fitme-cta fitme-cta--block fitme-preview-cta" disabled={busy} onClick={() => void checkout()}>
            {ctaLabel}
          </button>
          <p className="fitme-fine">Paiement unique. Aucun abonnement.</p>
        </div>
      </section>
    </FitmeAppShell>
  );
}
