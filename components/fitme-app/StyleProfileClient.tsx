"use client";

import { useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { apiJson } from "@/src/lib/fitme/client-api";
import type { UnlockedStyleProfile } from "@/src/lib/style-analysis/serialize";

function ScoreBadge({ score }: { score: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      setValue(Math.round(score * progress));
      if (progress < 1) requestAnimationFrame(frame);
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [inView, reduce, score]);

  return (
    <span ref={ref} className="fitme-report__badge">
      {reduce || !inView ? score : value}% MATCH
    </span>
  );
}

export function StyleProfileClient({
  analysisId,
  firstName,
}: {
  analysisId: string;
  firstName?: string | null;
}) {
  const [profile, setProfile] = useState<UnlockedStyleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLook, setOpenLook] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    trackFitmeEvent("style_profile_viewed");
    void apiJson<{ profile: UnlockedStyleProfile }>(`/api/style-analysis/${analysisId}/result`)
      .then((data) => setProfile(data.profile))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes("débloqué")) {
          window.location.href = `/analysis/${analysisId}/preview`;
          return;
        }
        setError(err instanceof Error ? err.message : "Impossible de charger le Style Profile.");
      });
  }, [analysisId]);

  if (error) {
    return (
      <FitmeAppShell>
        <FitmeErrorState title="Style Profile indisponible." message={error} onAction={() => window.location.reload()} />
      </FitmeAppShell>
    );
  }

  if (!profile) {
    return (
      <FitmeAppShell>
        <section className="fitme-flow">
          <p className="fitme-lead">Chargement de votre Style Profile…</p>
        </section>
      </FitmeAppShell>
    );
  }

  const cover = profile.looks[0]?.url;
  const hello = firstName || profile.firstName;

  async function downloadLook(url: string, index: number) {
    const response = await fetch(url);
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `fitme-look-${index + 1}.jpg`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <FitmeAppShell>
      <section className="fitme-flow fitme-profile-page">
        <p className="fitme-eyebrow">Votre Style Profile</p>
        <h1>{hello ? `${hello}, voici votre style.` : "Votre Style Profile"}</h1>

        <article className="fitme-report is-in" style={{ marginTop: "1.4rem" }}>
          <div className="fitme-report__glow" aria-hidden />
          <header className="fitme-report__head">
            <p>Top style</p>
          </header>
          <div className="fitme-report__hero">
            {cover ? (
              <div className="fitme-report__cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={profile.primaryStyle.name} />
              </div>
            ) : null}
            <div className="fitme-report__lead">
              <p>Top style</p>
              <strong>{profile.primaryStyle.name}</strong>
              <ScoreBadge score={Math.round(profile.primaryStyle.score)} />
              <em>{profile.primaryStyle.reason}</em>
            </div>
          </div>

          <div className="fitme-report__palette">
            <div>
              <p>Secondary</p>
              <strong className="fitme-display" style={{ fontSize: "1.7rem" }}>
                {profile.secondaryStyle.name}
              </strong>
              <ScoreBadge score={Math.round(profile.secondaryStyle.score)} />
              <p className="fitme-lead">{profile.secondaryStyle.reason}</p>
            </div>
          </div>

          <div className="fitme-report__palette">
            <div>
              <p>Vos couleurs.</p>
              <p className="fitme-lead" style={{ marginTop: "0.4rem" }}>
                Ces teintes fonctionnent particulièrement bien avec votre contraste visuel.
              </p>
              <ul className="fitme-report__swatches">
                {profile.bestColors.map((color, index) => (
                  <motion.li
                    key={color.hex}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <i style={{ background: color.hex }} />
                    {color.name}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <p>Moins flatteuses</p>
              <ul className="fitme-report__swatches is-avoid">
                {profile.lessFlatteringColors.map((color) => (
                  <li key={color.hex}>
                    <i style={{ background: color.hex }} />
                    {color.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="fitme-report__looks-wrap">
            <p>Vos looks.</p>
            <div className="fitme-looks-carousel">
              {profile.looks.map((look, index) => (
                <figure key={look.id}>
                  <button type="button" onClick={() => setOpenLook(look.url)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={look.url} alt={look.style} />
                  </button>
                  <figcaption>{look.style}</figcaption>
                  <button type="button" className="fitme-look-download" onClick={() => void downloadLook(look.url, index)}>
                    Télécharger
                  </button>
                </figure>
              ))}
            </div>
          </div>

          <ul className="fitme-tips">
            {profile.notes.slice(0, 4).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>

        <article className="fitme-share-card">
          <p className="fitme-eyebrow">Partager</p>
          <h2>Partager mon Style Profile</h2>
          <button type="button" className="fitme-cta fitme-cta--ghost" disabled>
            Bientôt
          </button>
        </article>

        <article className="fitme-fitcheck">
          <div className="fitme-fitcheck__copy">
            <p>FitCheck</p>
            <strong>Vous hésitez avant d’acheter ?</strong>
            <span>Vérifiez bientôt si un vêtement correspond à votre Style Profile.</span>
          </div>
        </article>
      </section>

      {openLook ? (
        <button type="button" className="fitme-lightbox" onClick={() => setOpenLook(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={openLook} alt="" />
        </button>
      ) : null}
    </FitmeAppShell>
  );
}
