"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { IMAGES } from "@/components/fitme-landing/config";
import { ANALYSIS_STATUS_COPY } from "@/src/lib/fitme/constants";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";

const STAGE_COPY = [
  "Analyse de vos photos…",
  "Comparaison des univers…",
  "Création de votre palette…",
  "Génération de vos looks…",
  "Votre Style Profile est presque prêt…",
];

type StatusPayload = {
  analysis?: {
    id: string;
    status: string;
    paymentStatus: string;
    isUnlocked: boolean;
    errorMessage: string | null;
  };
  error?: string;
};

export function AnalysisClient({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("queued");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let launched = false;

    async function poll() {
      const response = await fetch(`/api/style/analyses/${analysisId}`);
      const data = (await response.json()) as StatusPayload;
      if (cancelled) return;
      if (!response.ok) {
        setError(data.error ?? "Impossible de suivre l’analyse.");
        return;
      }
      const current = data.analysis?.status ?? "queued";
      setStatus(current);
      if (data.analysis?.errorMessage) setError(data.analysis.errorMessage);

      if (!launched && (current === "queued" || current === "failed")) {
        launched = true;
        void fetch(`/api/style/analyses/${analysisId}/process`, { method: "POST" });
      }

      if (current === "queued" || current === "analyzing" || current === "generating") {
        // keep polling
      }

      if (current === "completed") {
        trackFitmeEvent("analysis_completed");
        const unlocked = data.analysis?.isUnlocked;
        router.replace(unlocked ? "/style-profile" : `/analysis/${analysisId}/preview`);
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
      setTick((value) => value + 1);
    }, 2200);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [analysisId, router]);

  const label = useMemo(() => {
    if (status === "failed") return ANALYSIS_STATUS_COPY.failed;
    if (status === "generating") return STAGE_COPY[3];
    if (status === "analyzing") return STAGE_COPY[Math.min(2, 1 + (tick % 2))];
    return STAGE_COPY[Math.min(tick % STAGE_COPY.length, STAGE_COPY.length - 1)];
  }, [status, tick]);

  async function retry() {
    setError(null);
    setStatus("queued");
    await fetch(`/api/style/analyses/${analysisId}/process`, { method: "POST" });
  }

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ textAlign: "center" }}>
        <p className="fitme-eyebrow">Analyse</p>
        <h1>Votre style se dessine.</h1>
        <p className="fitme-lead">{label}</p>

        <div className="fitme-scan-stage">
          <div className="fitme-scan is-scanning">
            <div className="fitme-scan__frame is-shown is-front">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.original} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
              {label}
            </p>
          </div>
        </div>

        {status === "failed" ? (
          <>
            <p className="fitme-error">
              {error ?? "Quelque chose n’a pas fonctionné pendant la création de votre profil."}
            </p>
            <button type="button" className="fitme-cta" onClick={() => void retry()} style={{ marginTop: "1rem" }}>
              Réessayer
            </button>
          </>
        ) : (
          <p className="fitme-fine">Vous pouvez quitter cette page. L’analyse continue.</p>
        )}
      </section>
    </FitmeAppShell>
  );
}
