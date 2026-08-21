"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";

export function PaymentSuccessClient() {
  const router = useRouter();
  const search = useSearchParams();
  const analysisId = search.get("analysis_id");
  const [message, setMessage] = useState(
    analysisId ? "Confirmation du paiement…" : "Paiement reçu, mais l’analyse est introuvable.",
  );

  useEffect(() => {
    if (!analysisId) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      void fetch(`/api/style/analyses/${analysisId}`).then(async (response) => {
        const data = await response.json();
        attempts += 1;
        if (data.analysis?.isUnlocked) {
          window.clearInterval(timer);
          trackFitmeEvent("payment_completed");
          router.replace("/style-profile");
          return;
        }
        if (attempts > 12) {
          window.clearInterval(timer);
          setMessage("Paiement réussi. Le déblocage arrive avec un léger délai. Réessayez dans un instant.");
        } else {
          setMessage("Paiement réussi. Déblocage de votre Style Profile…");
        }
      });
    }, 1500);

    return () => window.clearInterval(timer);
  }, [analysisId, router]);

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ textAlign: "center" }}>
        <p className="fitme-eyebrow">Paiement</p>
        <h1>Merci.</h1>
        <p className="fitme-lead">{message}</p>
        {analysisId ? (
          <button
            type="button"
            className="fitme-cta"
            style={{ marginTop: "1.2rem" }}
            onClick={() => router.replace("/style-profile")}
          >
            Réessayer
          </button>
        ) : null}
      </section>
    </FitmeAppShell>
  );
}
