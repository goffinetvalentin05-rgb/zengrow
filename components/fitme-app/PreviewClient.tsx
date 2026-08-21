"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { apiJson } from "@/src/lib/fitme/client-api";
import type { AnalysisPreview } from "@/src/lib/style-analysis/serialize";

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

  const lockedSlots = preview?.lockedColorSlots ?? 4;
  const revealed = preview?.revealedColors ?? [];

  return (
    <FitmeAppShell>
      <section className="fitme-flow fitme-preview-page">
        <p className="fitme-eyebrow">Aperçu</p>
        <h1>Votre Style Profile est presque prêt.</h1>
        <p className="fitme-lead">
          Voici une révélation partielle. L’image finale et le rapport complet restent protégés jusqu’au déblocage.
        </p>

        {canceled ? (
          <p className="fitme-note">Paiement annulé. Rien n’a été débité. Votre aperçu est toujours là.</p>
        ) : null}

        <div className="fitme-locked-block">
          <p className="fitme-eyebrow">Style principal</p>
          <p className="fitme-locked-name">{preview?.primaryStyleName ?? "████████"}</p>
          {preview?.primaryStyleScore != null ? (
            <p className="fitme-lead" style={{ marginTop: "0.35rem" }}>
              Affinité {preview.primaryStyleScore}%
              {preview.confidence != null ? ` · confiance ${preview.confidence}%` : ""}
            </p>
          ) : null}
        </div>
        {preview?.teaserSummary ? <p className="fitme-lead">{preview.teaserSummary}</p> : null}
        <div className="fitme-locked-block">
          <p className="fitme-eyebrow">Style secondaire</p>
          <p className="fitme-locked-name is-small">{preview?.secondaryStyleName ?? "████████"}</p>
        </div>

        <div className="fitme-preview-palette">
          <p className="fitme-eyebrow">Palette</p>
          <ul className="fitme-swatches">
            {revealed.map((color) => (
              <li key={color.hex}>
                <i style={{ background: color.hex }} />
              </li>
            ))}
            {Array.from({ length: lockedSlots }, (_, index) => (
              <li key={`locked-${index}`} className="is-locked">
                <i />
              </li>
            ))}
          </ul>
        </div>

        <div className="fitme-locked-looks">
          <article className="fitme-locked-look">
            {preview?.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.portraitUrl} alt="" />
            ) : (
              <span />
            )}
          </article>
        </div>

        <motion.article
          className="fitme-paywall"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p className="fitme-eyebrow">Paiement unique · Sans abonnement</p>
          <h2>Débloquez le rapport complet.</h2>
          <p className="fitme-lead">
            Style principal, style secondaire, couleurs qui vous vont, et votre look recommandé — sauvegardés dans
            votre profil.
          </p>
          <p className="fitme-price">{preview?.priceLabel ?? "7,90 CHF"}</p>
          <ul className="fitme-benefit-list">
            <li>Top style et style secondaire</li>
            <li>Couleurs qui flattent — et celles à éviter</li>
            <li>Votre look recommandé, généré sur vous</li>
            <li>Style Profile enregistré dans votre compte</li>
          </ul>
        </motion.article>

        {error ? <p className="fitme-error">{error}</p> : null}

        {process.env.NODE_ENV === "development" ? (
          <p className="fitme-fine">
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

        <div className="fitme-sticky-cta">
          <button type="button" className="fitme-cta fitme-cta--block" disabled={busy} onClick={() => void checkout()}>
            {busy ? "Redirection…" : "Débloquer mon Style Profile"}
          </button>
          <p className="fitme-fine">Paiement unique. Aucun abonnement.</p>
        </div>
      </section>
    </FitmeAppShell>
  );
}
