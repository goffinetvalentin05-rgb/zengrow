"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { IMAGES } from "@/components/fitme-landing/config";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";

export function PaymentSuccessClient() {
  const router = useRouter();
  const search = useSearchParams();
  const analysisId = search.get("analysis_id");
  const [title, setTitle] = useState("Votre profil est débloqué.");
  const [message, setMessage] = useState(
    analysisId ? "Nous confirmons votre paiement…" : "Paiement reçu, mais l’analyse est introuvable.",
  );

  useEffect(() => {
    if (!analysisId) return;

    let attempts = 0;
    let confirmed = false;

    async function tick() {
      if (!confirmed) {
        await fetch(`/api/style/analyses/${analysisId}/confirm-payment`, { method: "POST" });
        confirmed = true;
      }

      const response = await fetch(`/api/style/analyses/${analysisId}`);
      const data = await response.json();
      const status = data.analysis?.status as string | undefined;
      const unlocked = Boolean(data.analysis?.isUnlocked);
      attempts += 1;

      if (status === "completed" && unlocked) {
        trackFitmeEvent("payment_completed");
        router.replace("/style-profile");
        return "done";
      }

      if (unlocked) {
        setTitle("Votre profil est débloqué.");
        setMessage("Nous créons maintenant vos looks.");
      }

      if (status === "failed" && unlocked) {
        setTitle("Votre profil est débloqué.");
        setMessage("La création des looks a rencontré un souci. Nous réessayons.");
        void fetch(`/api/style/analyses/${analysisId}/looks`, { method: "POST" });
      }

      if (attempts > 40) {
        setMessage("La génération prend un peu plus longtemps. Vous pouvez patienter ou réessayer.");
        return "wait";
      }
      return "poll";
    }

    void tick();
    const timer = window.setInterval(() => {
      void tick().then((state) => {
        if (state === "done") window.clearInterval(timer);
      });
    }, 2000);

    return () => window.clearInterval(timer);
  }, [analysisId, router]);

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ textAlign: "center" }}>
        <p className="fitme-eyebrow">Style Profile</p>
        <h1>{title}</h1>
        <p className="fitme-lead">{message}</p>

        <div className="fitme-scan-stage">
          <div className="fitme-scan is-scanning">
            <div className="fitme-scan__frame is-shown is-front">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.smartCasual} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="fitme-scan__grade" />
            <div className="fitme-scan__corners" aria-hidden>
              <i className="is-tl" />
              <i className="is-tr" />
              <i className="is-bl" />
              <i className="is-br" />
            </div>
            <div className="fitme-scan__beam" />
            <div className="fitme-scan__wash" />
            <p className="fitme-scan__status">
              <span className="fitme-scan__status-dot" />
              Création des looks
            </p>
          </div>
        </div>
      </section>
    </FitmeAppShell>
  );
}
