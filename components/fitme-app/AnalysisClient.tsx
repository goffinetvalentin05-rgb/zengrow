"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { ANALYSIS_STAGE_COPY, STYLE_UNIVERSES } from "@/src/lib/fitme/constants";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { apiJson } from "@/src/lib/fitme/client-api";

type StatusPayload = {
  analysis?: {
    id: string;
    status: string;
    paymentStatus: string;
    isUnlocked: boolean;
    errorMessage: string | null;
    portraitUrl: string | null;
  };
};

function stageFromStatus(status: string, startedAt: number) {
  if (status === "queued") return 0;
  if (status === "analyzing") {
    const elapsed = Date.now() - startedAt;
    if (elapsed < 2500) return 0;
    if (elapsed < 5000) return 1;
    if (elapsed < 8000) return 2;
    return 3;
  }
  return 3;
}

export function AnalysisClient({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState("queued");
  const [error, setError] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let launched = false;

    async function poll() {
      try {
        const data = await apiJson<StatusPayload>(`/api/style-analysis/${analysisId}/status`);
        if (cancelled) return;
        const current = data.analysis?.status ?? "queued";
        setStatus(current);
        if (data.analysis?.portraitUrl) setPortraitUrl(data.analysis.portraitUrl);
        if (data.analysis?.errorMessage) setError(data.analysis.errorMessage);

        if (!launched && (current === "queued" || current === "failed")) {
          launched = true;
          void fetch("/api/style-analysis/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ analysisId }),
          });
        }

        if (current === "preview_ready" || current === "awaiting_payment") {
          trackFitmeEvent("analysis_completed");
          router.replace(`/analysis/${analysisId}/preview`);
          return;
        }
        if (current === "paid" || current === "generating_looks" || current === "completed") {
          router.replace(
            current === "completed" && data.analysis?.isUnlocked
              ? `/style-profile/${analysisId}`
              : `/payment/success?analysis_id=${analysisId}`,
          );
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Impossible de suivre l’analyse.");
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

  const stage = stageFromStatus(status, startedAt);
  const label = status === "failed" ? "On n’a pas réussi à terminer votre analyse." : ANALYSIS_STAGE_COPY[stage];
  const chips = useMemo(() => STYLE_UNIVERSES.slice(0, 4 + (tick % 3)), [tick]);

  async function retry() {
    setError(null);
    setStatus("queued");
    await fetch("/api/style-analysis/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });
  }

  if (status === "failed") {
    return (
      <FitmeAppShell>
        <FitmeErrorState
          title="On n’a pas réussi à terminer votre analyse."
          message={error ?? "Réessayez. Vos photos sont toujours là."}
          onAction={() => void retry()}
        />
      </FitmeAppShell>
    );
  }

  return (
    <FitmeAppShell>
      <section className="fitme-flow fitme-analysis-page">
        <p className="fitme-eyebrow">Analyse</p>
        <h1>Votre style se dessine.</h1>
        <p className="fitme-lead">{label}</p>

        <div className="fitme-scan-stage">
          <div className="fitme-scan is-scanning">
            <div className="fitme-scan__frame is-shown is-front">
              {portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="fitme-scan-empty" />
              )}
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

        <ul className="fitme-scan-chips" aria-hidden>
          {chips.map((item, index) => (
            <motion.li
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              {item.name}
            </motion.li>
          ))}
        </ul>

        <p className="fitme-fine">Vous pouvez quitter cette page. L’analyse continue.</p>
      </section>
    </FitmeAppShell>
  );
}
