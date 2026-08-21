"use client";

import { useEffect, useState } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { IMAGES } from "@/components/fitme-landing/config";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import type { AnalysisPreview } from "@/src/lib/style-analysis/serialize";

export function PreviewClient({ analysisId }: { analysisId: string }) {
  const [preview, setPreview] = useState<AnalysisPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    trackFitmeEvent("paywall_viewed");
    void fetch(`/api/style/analyses/${analysisId}?view=preview`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Impossible de charger l’aperçu.");
        setPreview(data.preview as AnalysisPreview);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [analysisId]);

  async function checkout() {
    setBusy(true);
    setError(null);
    trackFitmeEvent("checkout_started");
    const response = await fetch(`/api/style/analyses/${analysisId}/checkout`, { method: "POST" });
    const data = (await response.json()) as { url?: string; error?: string; alreadyPaid?: boolean };
    if (data.alreadyPaid && data.url) {
      window.location.href = data.url;
      return;
    }
    if (!response.ok || !data.url) {
      setError(data.error ?? "Impossible de démarrer le paiement.");
      setBusy(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <FitmeAppShell>
      <section className="fitme-flow">
        <p className="fitme-eyebrow">Style Profile</p>
        <h1>Votre Style Profile est prêt.</h1>
        <p className="fitme-lead">Débloquez vos styles, votre palette et vos looks personnalisés.</p>

        <div className="fitme-locked-thumb" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.cleanMinimal} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(18px) saturate(0.8)" }} />
        </div>

        <div className="fitme-blur-stack" aria-hidden>
          <div className="fitme-blur-bar" />
          <div className="fitme-blur-bar" style={{ width: "72%" }} />
        </div>

        <p className="fitme-eyebrow">Top style</p>
        <p className="fitme-display" style={{ filter: "blur(7px)", userSelect: "none" }}>
          ██████████
        </p>

        <ul className="fitme-tips">
          <li>✓ Votre style principal a été identifié</li>
          <li>✓ Votre style secondaire a été identifié</li>
          <li>✓ Votre palette personnelle est prête</li>
          <li>✓ Vos looks personnalisés seront générés après déblocage</li>
        </ul>

        <article className="fitme-paywall">
          <p className="fitme-eyebrow">Paiement unique</p>
          <h2 className="fitme-display" style={{ fontSize: "1.8rem" }}>
            STYLE PROFILE
          </h2>
          <p style={{ marginTop: "0.35rem", fontSize: "1.35rem", fontWeight: 700 }}>{preview?.priceLabel ?? "7,90 CHF"}</p>
          <p className="fitme-lead" style={{ marginTop: "0.4rem" }}>
            Sans abonnement
          </p>
          <ul className="fitme-tips" style={{ border: 0, background: "transparent", padding: 0 }}>
            <li>Style principal</li>
            <li>Style secondaire</li>
            <li>Palette personnelle</li>
            <li>Looks personnalisés</li>
            <li>Style Profile sauvegardé</li>
          </ul>
        </article>

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
