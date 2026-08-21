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
        <p className="fitme-eyebrow">Style Profile</p>
        <h1>Votre Style Profile est prêt.</h1>
        <p className="fitme-lead">Une révélation partielle. Le détail complet se débloque ensuite.</p>

        {canceled ? (
          <p className="fitme-note">Paiement annulé. Votre aperçu est toujours là, rien n’a été débité.</p>
        ) : null}

        <div className="fitme-locked-block">
          <p className="fitme-eyebrow">Style principal</p>
          <p className="fitme-locked-name">████████</p>
        </div>
        <div className="fitme-locked-block">
          <p className="fitme-eyebrow">Style secondaire</p>
          <p className="fitme-locked-name is-small">████████</p>
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
          {Array.from({ length: preview?.lookSlots ?? 3 }, (_, index) => (
            <article key={index} className="fitme-locked-look">
              {preview?.portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.portraitUrl} alt="" />
              ) : (
                <span />
              )}
            </article>
          ))}
        </div>

        <ul className="fitme-tips">
          <li>✓ 2 styles identifiés</li>
          <li>✓ votre palette est prête</li>
          <li>✓ vos looks personnalisés seront générés après déblocage</li>
        </ul>

        <motion.article
          className="fitme-paywall"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p className="fitme-eyebrow">Paiement unique · Sans abonnement</p>
          <h2>Débloquez votre Style Profile.</h2>
          <p className="fitme-lead">Découvrez vos styles, votre palette et vos looks personnalisés.</p>
          <p className="fitme-price">{preview?.priceLabel ?? "7,90 CHF"}</p>
          <ul className="fitme-tips" style={{ border: 0, background: "transparent", padding: 0 }}>
            <li>Style principal</li>
            <li>Style secondaire</li>
            <li>Palette</li>
            <li>Conseils</li>
            <li>3 looks générés sur vous</li>
            <li>Profil sauvegardé</li>
          </ul>
        </motion.article>

        {error ? <p className="fitme-error">{error}</p> : null}

        <div className="fitme-sticky-cta">
          <button type="button" className="fitme-cta fitme-cta--block" disabled={busy} onClick={() => void checkout()}>
            {busy ? "Redirection…" : "Débloquer mon Style Profile"}
          </button>
        </div>
      </section>
    </FitmeAppShell>
  );
}
