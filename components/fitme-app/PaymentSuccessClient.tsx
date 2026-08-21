"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { apiJson } from "@/src/lib/fitme/client-api";

type Status = {
  analysis?: {
    status: string;
    isUnlocked: boolean;
    errorMessage: string | null;
    portraitUrl: string | null;
    looksGeneratedCount: number;
  };
};

export function PaymentSuccessClient() {
  const router = useRouter();
  const search = useSearchParams();
  const analysisId = search.get("analysis_id");
  const reduce = useReducedMotion();
  const [title, setTitle] = useState("Votre profil est débloqué.");
  const [message, setMessage] = useState("Nous créons maintenant vos looks personnalisés.");
  const [count, setCount] = useState(0);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;
    let attempts = 0;

    async function tick() {
      try {
        attempts += 1;
        await fetch(`/api/style/analyses/${analysisId}/confirm-payment`, { method: "POST" });
        const data = await apiJson<Status>(`/api/style-analysis/${analysisId}/status`);
        if (cancelled) return;
        const status = data.analysis?.status;
        setPortraitUrl(data.analysis?.portraitUrl ?? null);
        setCount(data.analysis?.looksGeneratedCount ?? 0);

        if (status === "completed" && data.analysis?.isUnlocked) {
          trackFitmeEvent("payment_completed");
          setTitle("Votre Style Profile est prêt.");
          setMessage("Vos looks sont générés. Vous pouvez les découvrir maintenant.");
          setReady(true);
          window.setTimeout(() => router.replace(`/style-profile/${analysisId}`), 2800);
          return "done";
        }

        if (status === "failed" && data.analysis?.isUnlocked) {
          setFailed(true);
          setError(data.analysis.errorMessage);
          void fetch(`/api/style-analysis/${analysisId}/generate-looks`, { method: "POST" });
          return "retry";
        }

        if (data.analysis?.isUnlocked) {
          setTitle("Votre profil est débloqué.");
          setMessage("Nous créons maintenant vos looks personnalisés.");
        } else if (attempts > 8) {
          setMessage("Nous confirmons encore votre paiement…");
        }
        return "poll";
      } catch {
        return "poll";
      }
    }

    void tick();
    const timer = window.setInterval(() => {
      void tick().then((state) => {
        if (state === "done") window.clearInterval(timer);
      });
    }, 2200);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [analysisId, router]);

  if (!analysisId) {
    return (
      <FitmeAppShell>
        <FitmeErrorState
          title="Paiement reçu, analyse introuvable."
          message="Reconnectez-vous, puis ouvrez votre compte pour retrouver votre Style Profile."
          href="/account"
          actionLabel="Ouvrir mon compte"
        />
      </FitmeAppShell>
    );
  }

  if (failed && error) {
    return (
      <FitmeAppShell>
        <FitmeErrorState
          title="On n’a pas réussi à générer vos looks."
          message="Votre paiement est bien enregistré. Réessayez la génération."
          onAction={() => {
            setFailed(false);
            void fetch(`/api/style-analysis/${analysisId}/generate-looks`, { method: "POST" });
          }}
        />
      </FitmeAppShell>
    );
  }

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ textAlign: "center" }}>
        <p className="fitme-eyebrow">Style Profile</p>
        <h1>{title}</h1>
        <p className="fitme-lead">{message}</p>

        <div className="fitme-look-fill">
          {[0, 1, 2].map((index) => (
            <motion.article
              key={index}
              className={count > index ? "is-filled" : ""}
              initial={reduce ? false : { opacity: 0.4, y: 10 }}
              animate={{ opacity: count > index || ready ? 1 : 0.55, y: 0 }}
            >
              {portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portraitUrl} alt="" />
              ) : (
                <span />
              )}
              <p>{count > index ? `Look ${index + 1}` : "En cours"}</p>
            </motion.article>
          ))}
        </div>

        {ready ? (
          <button type="button" className="fitme-cta" style={{ marginTop: "1.6rem" }} onClick={() => router.push(`/style-profile/${analysisId}`)}>
            Voir mon Style Profile
          </button>
        ) : (
          <p className="fitme-fine">Cela ne prend que quelques instants.</p>
        )}
      </section>
    </FitmeAppShell>
  );
}
